// Umpire Detail page

"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchPersonById, getMatchesByOfficial } from '@/lib/firestore';
import { Person, Match, UmpireProfile } from '@/types/firestore';
import { Player } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, ShieldCheck, CalendarClock, CheckCircle, Star, ListChecks, Info, Building, Briefcase, FileText, ShieldHalf, Loader2 } from "lucide-react";
import { UmpireRatingCard } from "@/components/profiles/UmpireRatingCard";
import { format } from 'date-fns';

const DetailItem: React.FC<{ label: string; value: string | number | undefined | React.ReactNode; icon?: React.ElementType; className?: string }> = ({ label, value, icon: Icon, className }) => (
  <div className={`flex items-start py-2 ${className || ''}`}>
    {Icon && <Icon className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {value !== undefined && value !== null ? (
        typeof value === 'string' || typeof value === 'number' ? (
          <p className="text-md text-foreground">{value}</p>
        ) : (
          <div className="text-md text-foreground">{value}</div>
        )
      ) : (
        <p className="text-md text-muted-foreground">N/A</p>
      )}
    </div>
  </div>
);

export default function UmpireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const umpireId = params.umpireId as string;

  const [person, setPerson] = React.useState<any | null>(null);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUmpire = async () => {
      try {
        const [p, m] = await Promise.all([
          fetchPersonById(umpireId),
          getMatchesByOfficial(umpireId)
        ]);
        setPerson(p);
        setMatches(m);
      } catch (error) {
        console.error('Error loading umpire:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUmpire();
  }, [umpireId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading umpire details...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Umpire Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn&apos;t find details for this umpire.</p>
            <Button onClick={() => router.push('/umpire-profiles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Umpire Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const umpireProfile = person.umpireProfile || {} as UmpireProfile;
  const name = person.displayName || `${person.firstName} ${person.lastName}`;
  const initials = `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/umpire-profiles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Umpire Profiles
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader className="bg-muted/50 p-6 flex flex-col items-center text-center space-y-3 md:flex-row md:text-left md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-md">
            <AvatarImage src={person.profileImageUrl} alt={name} data-ai-hint="person official" />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{name}</CardTitle>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="default" className="text-sm px-3 py-1">{umpireProfile.certificationLevel || 'Umpire'}</Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">{person.status || 'Active'}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Bio is not in Person schema yet, skipping or using a placeholder if needed */}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[hsl(var(--primary))]" /> Recent Match Assignments
              </CardTitle>
              <CardDescription>Matches recently officiated by {name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => {
                    const matchDate = match.dateTime ? new Date(match.dateTime) : (match.matchDate ? (typeof match.matchDate === 'string' ? new Date(match.matchDate) : match.matchDate.toDate()) : new Date());
                    const dateStr = format(matchDate, 'PPP');
                    return (
                      <Card key={match.id} className="bg-muted/30 p-4 shadow-sm">
                        <p className="font-semibold text-md">{match.homeTeamName || 'Home Team'} vs {match.awayTeamName || 'Away Team'}</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {dateStr}
                          <span className="ml-2 text-xs font-medium text-primary">(Umpire)</span>
                        </p>
                        {match.result && (
                          <p className="text-sm text-muted-foreground">Result: {match.result}</p>
                        )}
                        <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">
                          <Link href={`/scorecard/${match.id}`}>View Scorecard</Link>
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent match assignments found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]" /> Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Certification Level" value={umpireProfile.certificationLevel} icon={ShieldHalf} />
              <DetailItem label="Home Association" value={umpireProfile.homeAssociation} icon={Building} />
              <DetailItem label="Years Active" value={umpireProfile.yearsActive ? `${umpireProfile.yearsActive} years` : undefined} icon={CheckCircle} />
              <DetailItem label="Matches Officiated" value={umpireProfile.matchesOfficiated} icon={FileText} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[hsl(var(--primary))]" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Email Address" value={person.email || person.contactEmail} icon={Mail} />
              <DetailItem label="Phone Number" value={person.phone || person.contactPhone} icon={Phone} />
            </CardContent>
          </Card>

          <UmpireRatingCard
            umpireName={name}
            ratings={[
              { matchId: "1", date: "2024-11-30", rating: 5, feedback: "Excellent decisions throughout.", submittedBy: "Coach A" },
              { matchId: "2", date: "2024-11-23", rating: 4, feedback: "Very fair and consistent.", submittedBy: "Coach B" },
              { matchId: "3", date: "2024-11-16", rating: 5, submittedBy: "Coach C" },
              { matchId: "4", date: "2024-11-09", rating: 4, submittedBy: "Coach D" },
              { matchId: "5", date: "2024-11-02", rating: 3, feedback: "A few questionable LBW calls.", submittedBy: "Coach E" },
            ]}
            canRate={false}
          />
        </div>
      </div>
    </div>
  );
}
