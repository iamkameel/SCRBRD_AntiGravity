import React from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function FeaturesPage() {
  const currentFeatures = [
    "Comprehensive Match Operations & Live Scoring",
    "Player & Participant Management",
    "Advanced Analytics & Strategic Calendars",
    "League & Competition Structuring",
    "Scouting Assistant & Umpire Reviews",
    "Head-to-Head & Form Guide Analysis",
    "Coaching & Drill Library Planners",
    "Resource, Field, and Transport Logistics",
    "Financial & Sponsor Management Hub",
    "System Administration & Role Management"
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <PageHeader 
        title="Platform Features" 
        description="Explore the capabilities and modules available in the SCRBRD School Sports OS."
      />
      
      <div className="grid gap-6">
        <Card variant="glass" className="border-white/10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="h-48 w-48 text-primary animate-float" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-black mb-6 tracking-tight flex items-center gap-3">
                <span className="p-2 bg-primary/10 rounded-xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                </span>
                Active Capabilities
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {currentFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
