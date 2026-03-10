"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School, Users, Calendar, Tag, User } from "lucide-react";

interface TeamPreviewCardProps {
  teamName: string;
  schoolName?: string;
  divisionName?: string;
  ageGroup?: string;
  suffix?: string;
  seasonName?: string;
  coaches: Array<{ id: string; firstName: string; lastName: string; role?: string }>;
  nickname?: string;
  abbreviation?: string;
  schoolColors?: {
    primary: string;
    secondary?: string;
  };
  teamColors?: {
    primary: string;
    secondary: string;
  };
}

export function TeamPreviewCard({
  teamName,
  schoolName,
  divisionName,
  ageGroup,
  suffix,
  seasonName,
  coaches,
  nickname,
  abbreviation,
  schoolColors,
  teamColors,
}: TeamPreviewCardProps) {
  // Team colors take precedence over school colors
  const primaryColor = teamColors?.primary || schoolColors?.primary || '#10B981';
  const secondaryColor = teamColors?.secondary || schoolColors?.secondary || '#059669';


  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div 
        className="p-4 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{teamName || 'Team Name'}</h3>
            {nickname && (
              <p className="text-sm opacity-90">&quot;{nickname}&quot;</p>
            )}
          </div>
          {abbreviation && (
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {abbreviation}
            </Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* School */}
        {schoolName && (
          <div className="flex items-center gap-2 text-sm">
            <School className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{schoolName}</span>
          </div>
        )}

        {/* Division & Age Group */}
        <div className="flex items-center gap-4 text-sm">
          {ageGroup && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{ageGroup}</span>
            </div>
          )}
          {suffix && (
            <Badge variant="outline">{suffix}</Badge>
          )}
          {divisionName && (
            <span className="text-muted-foreground">{divisionName}</span>
          )}
        </div>

        {/* Season */}
        {seasonName && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{seasonName}</span>
          </div>
        )}

        {/* Coaches */}
        {coaches.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span>Coaching Staff</span>
            </div>
            <div className="space-y-1">
              {coaches.map((coach) => (
                <div key={coach.id} className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{coach.firstName} {coach.lastName}</span>
                  {coach.role && (
                    <Badge variant="outline" className="text-xs py-0">
                      {coach.role}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for coaches */}
        {coaches.length === 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="italic">No coaches assigned</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-muted/50 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Preview — Team will be created with these details
        </p>
      </div>
    </Card>
  );
}
