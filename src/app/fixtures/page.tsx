// Fixtures page - displays match schedule

"use client";

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, Timestamp, orderBy, query as firestoreQuery, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays, Clock, MapPin, ListChecks, AlertTriangle, Loader2, Users, Shield, BarChart2, Info, LayoutGrid, List as ListIcon,
  MoreHorizontal, Edit3, FileText, Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isFuture, subDays, isWithinInterval, parseISO, isValid, isEqual } from 'date-fns';
import { cn } from "@/lib/utils";
import { fetchTeams, fetchDivisions, fetchUmpires, fetchScorers } from '@/lib/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";


interface FirestoreFixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  matchType: 'T20' | 'ODI' | 'Test';
  venueId: string;
  scheduledDate: Timestamp | null;
  time: string;
  overs?: number;
  ageGroup: string;
  status: 'Scheduled' | 'Team Confirmed' | 'Ground Ready' | 'Live' | 'Completed' | 'Match Abandoned' | 'Rain-Delay' | 'Play Suspended';
  umpireIds: string[];
  scorerId: string | null;
  division?: string | null;
  leagueId?: string | null;
  provinceId?: string | null;
  createdAt?: Timestamp;
}

export interface DisplayFixture {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: string; 
  displayDate: string; 
  time: string;
  location: string;
  status: FirestoreFixture['status'];
  matchType: FirestoreFixture['matchType'];
  ageGroup?: string;
  division?: string | null;
  umpiresDisplay?: string;
  scorerName?: string | null;
}

const fetchFixtures = async (): Promise<DisplayFixture[]> => {
  const matchesCollectionRef = collection(db, 'matches');
  const q = firestoreQuery(matchesCollectionRef, orderBy('dateTime', 'desc'));
  
  // Fetch matches, teams, divisions, umpires, and scorers in parallel
  const [querySnapshot, teams, divisions, umpires, scorers] = await Promise.all([
    getDocs(q),
    fetchTeams(),
    fetchDivisions(),
    fetchUmpires(),
    fetchScorers()
  ]);
  
  const fixturesList = querySnapshot.docs.reduce((acc, docSnapshot) => {
    const data = docSnapshot.data() as any; // Cast to any to handle Match fields flexibly
    
    let scheduledDateTime: Date | null = null;
    
    // Handle various date formats (ISO string, Timestamp, etc.)
    if (data.dateTime) {
      if (typeof data.dateTime.toDate === 'function') {
        scheduledDateTime = data.dateTime.toDate();
      } else {
        scheduledDateTime = new Date(data.dateTime);
      }
    } else if (data.matchDate) {
      if (typeof data.matchDate.toDate === 'function') {
        scheduledDateTime = data.matchDate.toDate();
      } else {
        scheduledDateTime = new Date(data.matchDate);
      }
    }

    if (scheduledDateTime && isValid(scheduledDateTime)) {
      const homeTeam = teams.find(t => t.id === data.homeTeamId);
      const awayTeam = teams.find(t => t.id === data.awayTeamId);

      // Resolve Division Name
      let divisionName = data.division; // Use stored name if available
      if (!divisionName || divisionName === 'N/A') {
          const divId = data.divisionId || homeTeam?.divisionId;
          if (divId) {
              const div = divisions.find(d => d.id === divId);
              if (div) divisionName = div.name;
          }
      }
      if (!divisionName) divisionName = 'N/A';

      // Use optimistic names if available, otherwise lookup or ID
      const homeTeamName = data.homeTeamName || homeTeam?.name || data.homeTeamId;
      const awayTeamName = data.awayTeamName || awayTeam?.name || data.awayTeamId;

      const umpiresDisplayList = data.umpires && data.umpires.length > 0
        ? data.umpires.map((id: string) => {
            const u = umpires.find(p => p.id === id);
            return u ? (u.displayName || `${u.firstName} ${u.lastName}`) : id;
          }).filter(Boolean).join(', ')
        : 'N/A';
      
      const scorer = data.scorer ? scorers.find(s => s.id === data.scorer) : null;
      const scorerName = scorer ? (scorer.displayName || `${scorer.firstName} ${scorer.lastName}`) : null;

      acc.push({
        id: docSnapshot.id,
        homeTeamId: data.homeTeamId,
        homeTeamName: homeTeamName,
        awayTeamId: data.awayTeamId,
        awayTeamName: awayTeamName,
        date: format(scheduledDateTime, 'yyyy-MM-dd'),
        displayDate: format(scheduledDateTime, 'EEE, MMM d, yyyy'),
        time: data.time || format(scheduledDateTime, 'HH:mm'),
        location: data.venue || data.fieldId || 'TBC',
        status: data.status || 'Scheduled',
        matchType: data.matchType || 'T20',
        ageGroup: data.ageGroup || divisionName,
        division: divisionName,
        umpiresDisplay: umpiresDisplayList,
        scorerName: scorerName || 'N/A',
      } as DisplayFixture);
    }
    return acc;
  }, [] as DisplayFixture[]);
  
  return fixturesList;
};

const getStatusBadgeVariant = (status: DisplayFixture["status"], dateStr: string): "default" | "secondary" | "destructive" | "outline" => {
  const fixtureDate = parseISO(dateStr); 
  const today = new Date();
  today.setHours(0,0,0,0); 
  const fiveDaysFromNow = subDays(new Date(), -5); 
  fiveDaysFromNow.setHours(0,0,0,0);

  if (status === "Scheduled" && isFuture(fixtureDate) && isWithinInterval(fixtureDate, { start: today, end: fiveDaysFromNow })) {
    return "default"; 
  }

  switch (status) {
    case "Live":
      return "destructive";
    case "Completed":
        return "default"; 
    case "Match Abandoned":
      return "secondary";
    case "Rain-Delay":
    case "Play Suspended":
      return "default"; 
    case "Scheduled": 
    default:
      return "outline";
  }
};

const getStatusDisplayName = (status: DisplayFixture["status"], dateStr: string): string => {
  const fixtureDate = parseISO(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  const fiveDaysFromNow = subDays(new Date(), -5);
  fiveDaysFromNow.setHours(0,0,0,0);

  if (status === "Scheduled" && isFuture(fixtureDate) && isWithinInterval(fixtureDate, { start: today, end: fiveDaysFromNow })) {
    return "Upcoming";
  }
  return status;
};

const FixtureCard: React.FC<{ fixture: DisplayFixture, onAttemptDelete: (fixtureId: string) => void }> = ({ fixture, onAttemptDelete }) => {
  const currentStatus = getStatusDisplayName(fixture.status, fixture.date);
  const badgeVariant = getStatusBadgeVariant(fixture.status, fixture.date);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <CardTitle className="text-lg">{fixture.homeTeamName} vs {fixture.awayTeamName}</CardTitle>
            <CardDescription className="text-xs pt-1">
              {fixture.matchType} &bull; {fixture.ageGroup} {fixture.division && `(${fixture.division} Div)`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Badge
              variant={badgeVariant}
              className={cn(
                "whitespace-nowrap",
                currentStatus === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent", 
                fixture.status === "Completed" && "bg-green-600 text-white border-transparent",
                fixture.status === "Live" && "bg-destructive text-destructive-foreground border-transparent animate-pulse",
                (fixture.status === "Rain-Delay" || fixture.status === "Play Suspended") && "bg-yellow-500 text-black border-transparent",
                fixture.status === "Match Abandoned" && "bg-gray-500 text-white opacity-80 border-transparent"
              )}
            >
              {currentStatus}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Fixture Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/fixtures/edit/${fixture.id}`}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Fixture
                  </Link>
                </DropdownMenuItem>
                {(fixture.status === "Completed" || fixture.status === "Match Abandoned") && (
                  <DropdownMenuItem asChild>
                    <Link href={`/scorecard/${fixture.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Scorecard
                    </Link>
                  </DropdownMenuItem>
                )}
                {(currentStatus === "Upcoming" || fixture.status === "Scheduled") && (
                  <DropdownMenuItem asChild>
                    <Link href={`/prematch-team/${fixture.id}`}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Pre-Match
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => onAttemptDelete(fixture.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Fixture
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-muted-foreground">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>{fixture.displayDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{fixture.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{fixture.location}</span>
          </div>
        </div>
          {(fixture.umpiresDisplay && fixture.umpiresDisplay !== 'N/A') || (fixture.scorerName && fixture.scorerName !== 'N/A') ? (
          <div className="pt-2 border-t mt-2 text-xs text-muted-foreground space-y-1">
            {fixture.umpiresDisplay && fixture.umpiresDisplay !== 'N/A' && (
              <div className="flex items-center">
                <Users className="mr-2 h-3.5 w-3.5 text-primary/80" />
                <span>Umpires: {fixture.umpiresDisplay}</span>
              </div>
            )}
            {fixture.scorerName && fixture.scorerName !== 'N/A' && (
              <div className="flex items-center">
                <Info className="mr-2 h-3.5 w-3.5 text-primary/80" />
                <span>Scorer: {fixture.scorerName}</span>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
 );
};

export default function FixturesPage() {
  const { data: fixtures, isLoading, isError, error } = useQuery<DisplayFixture[], Error>({
    queryKey: ['fixtures'],
    queryFn: fetchFixtures,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fixtureDates = React.useMemo(() => {
    if (!fixtures) return [];
    return fixtures.map(f => parseISO(f.date)).filter(isValid);
  }, [fixtures]);

  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<Date | undefined>(new Date());

  const fixturesForSelectedDate = React.useMemo(() => {
    if (!selectedCalendarDate || !fixtures) return [];
    return fixtures.filter(fixture => {
      const fixtureDate = parseISO(fixture.date);
      return isEqual(fixtureDate, selectedCalendarDate);
    });
  }, [selectedCalendarDate, fixtures]);

  const calendarModifiers = {
    hasFixture: fixtureDates,
  };
  const calendarModifiersStyles = {
    hasFixture: {
      fontWeight: 'bold',
      color: 'hsl(var(--primary))',
      textDecoration: 'underline',
    },
  };

  const [fixtureToDelete, setFixtureToDelete] = React.useState<string | null>(null);

  const handleDeleteFixture = async (fixtureIdToDelete: string) => {
    if (!fixtureIdToDelete) return;
    try {
      await deleteDoc(doc(db, 'matches', fixtureIdToDelete));
      toast({
        title: "Fixture Deleted",
        description: `The fixture was successfully deleted.`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    } catch (err: any) {
      console.error("Error deleting fixture:", err);
      toast({
        title: "Deletion Failed",
        description: `There was an error deleting the fixture: ${err.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setFixtureToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading fixtures...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" /> Error Loading Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">There was a problem fetching the fixtures from the database.</p>
          <p className="text-xs text-muted-foreground mt-2">Details: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" /> Match Fixtures
              </CardTitle>
              <CardDescription>Upcoming and past match schedules from the database.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/fixtures/create">Create New Fixture</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4">
              <TabsTrigger value="card" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" />Card View</TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2"><ListIcon className="h-4 w-4" />List View</TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              {fixtures && fixtures.length > 0 ? (
                <div className="space-y-4">
                  {fixtures.map((fixture) => (
                    <FixtureCard key={`card-${fixture.id}`} fixture={fixture} onAttemptDelete={setFixtureToDelete} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No fixtures found for card view.</p>
              )}
            </TabsContent>

            <TabsContent value="list">
              {fixtures && fixtures.length > 0 ? (
                <ScrollArea className="h-[600px] border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fixtures.map((fixture) => {
                        const currentStatus = getStatusDisplayName(fixture.status, fixture.date);
                        const badgeVariant = getStatusBadgeVariant(fixture.status, fixture.date);
                        return (
                          <TableRow key={`list-${fixture.id}`}>
                            <TableCell>{fixture.displayDate}</TableCell>
                            <TableCell>{fixture.time}</TableCell>
                            <TableCell>
                              <div className="font-medium">{fixture.homeTeamName} vs {fixture.awayTeamName}</div>
                              <div className="text-xs text-muted-foreground">{fixture.ageGroup} {fixture.division && `(${fixture.division} Div)`}</div>
                            </TableCell>
                            <TableCell>{fixture.location}</TableCell>
                            <TableCell>{fixture.matchType}</TableCell>
                            <TableCell>
                              <Badge
                                variant={badgeVariant}
                                className={cn(
                                  "whitespace-nowrap",
                                  currentStatus === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent",
                                  fixture.status === "Completed" && "bg-green-600 text-white border-transparent",
                                  fixture.status === "Live" && "bg-destructive text-destructive-foreground border-transparent animate-pulse",
                                  (fixture.status === "Rain-Delay" || fixture.status === "Play Suspended") && "bg-yellow-500 text-black border-transparent",
                                  fixture.status === "Match Abandoned" && "bg-gray-500 text-white opacity-80 border-transparent"
                                )}
                              >
                                {currentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Fixture Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/fixtures/edit/${fixture.id}`}>
                                      <Edit3 className="mr-2 h-4 w-4" />
                                      Edit Fixture
                                    </Link>
                                  </DropdownMenuItem>
                                  {(fixture.status === "Completed" || fixture.status === "Match Abandoned") && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/scorecard/${fixture.id}`}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Scorecard
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  {(currentStatus === "Upcoming" || fixture.status === "Scheduled") && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/prematch-team/${fixture.id}`}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Pre-Match
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setFixtureToDelete(fixture.id)}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Fixture
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-4">No fixtures found for list view.</p>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2 lg:w-2/5 flex justify-center md:justify-start">
                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={setSelectedCalendarDate}
                    modifiers={calendarModifiers}
                    modifiersStyles={calendarModifiersStyles}
                    className="rounded-md border shadow-sm p-2"
                    initialFocus
                  />
                </div>
                <div className="md:w-1/2 lg:w-3/5">
                  <h4 className="text-lg font-semibold mb-2">
                    Fixtures for: {selectedCalendarDate ? format(selectedCalendarDate, 'PPP') : 'No date selected'}
                  </h4>
                  {fixturesForSelectedDate.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-3">
                      <div className="space-y-3">
                        {fixturesForSelectedDate.map((fixture) => (
                           <FixtureCard key={`calendar-${fixture.id}`} fixture={fixture} onAttemptDelete={setFixtureToDelete} />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground py-4">
                      {selectedCalendarDate ? 'No fixtures on this date.' : 'Select a date to see fixtures.'}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {(!fixtures || fixtures.length === 0) && (
             <p className="text-muted-foreground text-center py-4 mt-4">No fixtures found in the database. Try creating some!</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!fixtureToDelete} onOpenChange={(open) => !open && setFixtureToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fixture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteFixture(fixtureToDelete!)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
