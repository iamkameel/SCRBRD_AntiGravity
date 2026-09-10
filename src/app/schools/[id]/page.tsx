import { 
  fetchSchoolById, 
  getTeamsBySchool, 
  fetchSchoolStaff, 
  fetchSchoolNews, 
  fetchSchoolStats,
  fetchMatches 
} from "@/lib/firestore";
import { getMockSchoolData } from "@/lib/mockSchoolData";
import { SchoolHero } from "@/components/schools/profile/SchoolHero";
import { SchoolStatsCards } from "@/components/schools/profile/SchoolStatsCards";
import { SchoolTabs } from "@/components/schools/profile/SchoolTabs";
import { SchoolSidebar } from "@/components/schools/profile/SchoolSidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SchoolProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const schoolId = params.id;

  // Attempt parallel data fetching from Firestore
  let dbSchool = null;
  let teams: any[] = [];
  let staff: any[] = [];
  let news: any[] = [];
  let stats: any = null;
  let schoolFixtures: any[] = [];

  try {
    const [fetchedSchool, fetchedTeams, fetchedStaff, fetchedNews, fetchedStats, allMatches] = await Promise.all([
      fetchSchoolById(schoolId),
      getTeamsBySchool(schoolId),
      fetchSchoolStaff(schoolId),
      fetchSchoolNews(schoolId),
      fetchSchoolStats(schoolId),
      fetchMatches(50)
    ]);

    dbSchool = fetchedSchool;
    teams = fetchedTeams || [];
    staff = fetchedStaff || [];
    news = fetchedNews || [];
    stats = fetchedStats;

    if (allMatches && teams.length > 0) {
      const teamIds = new Set(teams.map(t => t.id));
      schoolFixtures = allMatches.filter(m => 
        teamIds.has(m.homeTeamId) || teamIds.has(m.awayTeamId)
      ).filter(m => m.status === 'scheduled').slice(0, 5);
    }
  } catch (err) {
    console.warn(`[SchoolProfilePage] Firestore fetch error for schoolId '${schoolId}', falling back to mock data:`, err);
  }

  // Gracefully fallback to mock data if Firestore returns null
  const mockFallback = getMockSchoolData(schoolId);
  const school = dbSchool || mockFallback.school;
  const activeTeams = teams.length > 0 ? teams : mockFallback.teams;
  const activeStaff = staff.length > 0 ? staff : mockFallback.staff;
  const activeFixtures = schoolFixtures.length > 0 ? schoolFixtures : mockFallback.fixtures;
  const activeStats = stats || mockFallback.stats;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link href="/schools">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/50 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to Schools
            </Button>
          </Link>
          <Link href={`/schools/add`}>
            <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-card">
              <Settings className="h-4 w-4 text-primary" />
              Manage School
            </Button>
          </Link>
        </div>
      </div>

      {/* School Hero Banner */}
      <SchoolHero school={school} />

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <SchoolStatsCards stats={activeStats} />

            {/* About Section */}
            <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
              <h2 className="text-2xl font-bold font-head text-foreground flex items-center gap-3">
                <span className="w-2 h-6 rounded-full bg-primary inline-block" />
                About {school.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {school.name} is a premier sports institution with a rich heritage of athletic and academic excellence. 
                {school.establishmentYear ? ` Established in ${school.establishmentYear}, ` : ' '}
                the school fosters high-performance development across all junior and senior divisions, producing top-tier athletes for provincial and national representation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-card border border-border/40 space-y-1">
                  <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    High-Performance Standard
                  </h3>
                  <p className="text-xs text-muted-foreground">Dedicated coaching staff, structured player pathways, and analytical ball-by-ball tracking.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/40 space-y-1">
                  <h3 className="font-semibold text-sm text-accent flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    State-of-the-Art Facilities
                  </h3>
                  <p className="text-xs text-muted-foreground">Equipped with turf ovals, practice net bays, video feedback systems, and medical rehab bays.</p>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <SchoolTabs teams={activeTeams} staff={activeStaff} fixtures={activeFixtures} school={school} />
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-1">
            <SchoolSidebar school={school} news={news} />
          </div>
        </div>
      </div>
    </div>
  );
}
