import { 
  fetchPersonById, 
  fetchSchools,
  fetchTeams,
  getTeamsBySchool 
} from "@/lib/firestore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stats/StatCard";
import { PerformanceRing } from "@/components/stats/PerformanceRing";
import { ProfileTabs, TabPanel } from "@/components/ui/ProfileTabs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, Edit, Share2, Mail, Phone, Calendar, 
  TrendingUp, Target, Users, Award, Activity,
  MapPin, School as SchoolIcon
} from "lucide-react";
import { Player as Person } from "@/lib/store";
import { SkillsManager } from "@/components/people/SkillsManager";

export const dynamic = 'force-dynamic';

export default async function PersonDetailPage(props: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ tab?: string }> 
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const { id } = params;
  const activeTab = searchParams.tab || 'overview';
  
  const person = await fetchPersonById(id) as Person | null;
  
  if (!person) {
    notFound();
  }

  // Fetch related data
  const [allSchools, allTeams] = await Promise.all([
    fetchSchools(),
    fetchTeams()
  ]);

  const school = person.schoolId ? allSchools.find(s => s.id === person.schoolId) : null;
  const relatedTeams = person.teamIds 
    ? allTeams.filter(t => person.teamIds?.includes(t.id))
    : [];

  const isPlayer = person.role?.toLowerCase().includes('player') || person.role === 'Player';
  const isCoach = person.role?.toLowerCase().includes('coach');

  // Calculate stats
  const matchesPlayed = person.stats?.matchesPlayed || 0;
  const totalRuns = person.stats?.totalRuns || 0;
  const battingAvg = person.stats?.battingAverage || 0;
  const wickets = person.stats?.wicketsTaken || 0;
  const bowlingAvg = person.stats?.bowlingAverage || 0;

  // Calculate performance percentage (mock for now)
  const performanceScore = matchesPlayed > 0 
    ? Math.min(100, Math.round(((totalRuns + wickets * 20) / matchesPlayed) * 2))
    : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(isPlayer ? [
      { id: 'stats', label: 'Statistics' },
      { id: 'skills', label: 'Skills' },
      { id: 'performance', label: 'Performance' },
    ] : []),
    ...(isCoach ? [
      { id: 'attributes', label: 'Attributes' },
      { id: 'history', label: 'History' },
    ] : []),
    ...(person.role === 'Umpire' ? [
      { id: 'attributes', label: 'Attributes' },
    ] : []),
    ...(person.role === 'Scorer' ? [
      { id: 'attributes', label: 'Attributes' },
    ] : []),
    ...(['Doctor', 'Physiotherapist', 'Trainer', 'First Aid'].includes(person.role || '') ? [
      { id: 'attributes', label: 'Attributes' },
    ] : []),
    ...(person.role === 'Grounds-Keeper' ? [
      { id: 'attributes', label: 'Attributes' },
    ] : []),
    { id: 'teams', label: 'Teams', badge: relatedTeams.length || undefined },
  ];

  const getRatingColor = (rating: number) => {
    if (rating < 8) return "text-red-500";
    if (rating < 14) return "text-yellow-500";
    return "text-emerald-500";
  };

  const renderAttributeBlock = (title: string, attributes: Record<string, number> | undefined) => {
    if (!attributes) return null;
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">{title}</h3>
        <div className="space-y-3">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${Number(value) >= 14 ? 'bg-emerald-500' : Number(value) >= 8 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${(Number(value) / 20) * 100}%` }}
                  />
                </div>
                <span className={`font-mono font-bold w-6 text-right ${getRatingColor(Number(value))}`}>{value as number}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        href="/people" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to People Directory
      </Link>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-background" />
        
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            {/* Profile Image */}
            <div className="relative">
              <div className="relative h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden">
                <Image
                  src={`https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=0ea5e9&color=fff&size=256`}
                  alt={`${person.firstName} ${person.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              {isPlayer && (
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm border-4 border-background">
                  #23
                </div>
              )}
            </div>

            {/* Info & Actions */}
            <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{person.firstName} {person.lastName}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="text-sm px-3 py-1">
                    {person.role || 'Member'}
                  </Badge>
                  {school && (
                    <Link href={`/schools/${school.id}`}>
                      <Badge variant="outline" className="text-sm px-3 py-1 hover:bg-accent">
                        <SchoolIcon className="h-3 w-3 mr-1" />
                        {school.name}
                      </Badge>
                    </Link>
                  )}
                  {isPlayer && person.physicalAttributes?.battingHand && (
                    <Badge variant="secondary" className="text-sm">
                      {person.physicalAttributes.battingHand}
                    </Badge>
                  )}
                  {isPlayer && person.physicalAttributes?.bowlingStyle && (
                    <Badge variant="secondary" className="text-sm">
                      {person.physicalAttributes.bowlingStyle}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                  {person.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      <span>{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid - Only for Players */}
      {isPlayer && matchesPlayed > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Matches Played"
            value={matchesPlayed}
            icon={Activity}
            description="Total appearances"
          />
          {totalRuns > 0 && (
            <StatCard
              label="Total Runs"
              value={totalRuns}
              icon={Target}
              trend="up"
              trendValue={`Avg ${battingAvg}`}
              variant="success"
            />
          )}
          {wickets > 0 && (
            <StatCard
              label="Wickets"
              value={wickets}
              icon={Award}
              trend="up"
              trendValue={`Avg ${bowlingAvg}`}
              variant="success"
            />
          )}
          <StatCard
            label="Strike Rate"
            value={person.stats?.strikeRate?.toFixed(1) || 'N/A'}
            icon={TrendingUp}
            description="Runs per 100 balls"
          />
          <Card className="p-6 flex flex-col items-center justify-center">
            <PerformanceRing
              value={performanceScore}
              size="md"
              label="Performance Score"
              color={performanceScore >= 70 ? 'success' : performanceScore >= 50 ? 'warning' : 'danger'}
            />
          </Card>
        </div>
      )}

      {/* Tabs */}
      <ProfileTabs tabs={tabs} activeTab={activeTab} basePath={`/people/${id}`} />

      {/* Tab Content */}
      <TabPanel>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="grid grid-cols-2 gap-4">
                  {person.title && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Title</div>
                      <div className="font-medium">{person.title}</div>
                    </div>
                  )}
                  {person.role && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Role</div>
                      <div className="font-medium">{person.role}</div>
                    </div>
                  )}
                  {school && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">School</div>
                      <Link href={`/schools/${school.id}`} className="font-medium text-primary hover:underline">
                        {school.name}
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Physical Attributes - Players only */}
              {isPlayer && person.physicalAttributes && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {person.physicalAttributes.height && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Height</div>
                        <div className="text-2xl font-bold">{person.physicalAttributes.height} cm</div>
                      </div>
                    )}
                    {person.physicalAttributes.weight && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Weight</div>
                        <div className="text-2xl font-bold">{person.physicalAttributes.weight} kg</div>
                      </div>
                    )}
                    {person.physicalAttributes.battingHand && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Batting</div>
                        <div className="text-lg font-semibold">{person.physicalAttributes.battingHand}</div>
                      </div>
                    )}
                    {person.physicalAttributes.bowlingStyle && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bowling</div>
                        <div className="text-lg font-semibold">{person.physicalAttributes.bowlingStyle}</div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Coach Overview Details */}
              {isCoach && person.coachProfile && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Coaching Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Qualification</div>
                        <div className="font-medium">{person.coachProfile.qualificationLevel || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Experience</div>
                        <div className="font-medium">{person.coachProfile.coachingSince ? `${new Date().getFullYear() - person.coachProfile.coachingSince} Years` : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Reputation</div>
                        <div className="flex text-yellow-500">
                          {[...Array(person.coachProfile.reputation || 1)].map((_, i) => (
                            <Award key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current Ability</div>
                        <div className={`font-bold ${getRatingColor(person.coachProfile.currentAbility)}`}>
                          {person.coachProfile.currentAbility}/20
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {person.coachProfile.philosophySummary && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Coaching Philosophy</h3>
                      <p className="text-muted-foreground italic">&quot;{person.coachProfile.philosophySummary}&quot;</p>
                    </Card>
                  )}

                  {person.coachProfile.coachTraits && person.coachProfile.coachTraits.length > 0 && (
                     <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Traits & Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.coachProfile.coachTraits.map((trait: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-primary/20 text-primary">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Umpire Overview Details */}
              {person.role === 'Umpire' && person.umpireProfile && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Umpire Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Certification</div>
                        <div className="font-medium">{person.umpireProfile.certificationLevel || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Association</div>
                        <div className="font-medium">{person.umpireProfile.homeAssociation || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Years Active</div>
                        <div className="font-medium">{person.umpireProfile.yearsActive || 0} Years</div>
                      </div>
                    </div>
                  </Card>

                  {person.umpireProfile.umpireTraits && person.umpireProfile.umpireTraits.length > 0 && (
                     <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Traits & Style</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.umpireProfile.umpireTraits.map((trait: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-primary/20 text-primary">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Scorer Overview Details */}
              {person.role === 'Scorer' && person.scorerProfile && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Scorer Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Certification</div>
                        <div className="font-medium">{person.scorerProfile.certificationLevel || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Method</div>
                        <div className="font-medium">{person.scorerProfile.preferredMethod || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Experience</div>
                        <div className="font-medium">{person.scorerProfile.experienceYears || 0} Years</div>
                      </div>
                    </div>
                  </Card>

                  {person.scorerProfile.scorerTraits && person.scorerProfile.scorerTraits.length > 0 && (
                     <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Traits & Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.scorerProfile.scorerTraits.map((trait: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-primary/20 text-primary">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Medical Overview Details */}
              {['Doctor', 'Physiotherapist', 'Trainer', 'First Aid'].includes(person.role || '') && person.medicalProfile && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Medical Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Qualification</div>
                        <div className="font-medium">{person.medicalProfile.qualification || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Registration</div>
                        <div className="font-medium">{person.medicalProfile.registrationNumber || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Experience</div>
                        <div className="font-medium">{person.medicalProfile.experienceYears || 0} Years</div>
                      </div>
                    </div>
                  </Card>

                  {person.medicalProfile.specializations && person.medicalProfile.specializations.length > 0 && (
                     <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.medicalProfile.specializations.map((spec: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-primary/20 text-primary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Groundskeeper Overview Details */}
              {person.role === 'Grounds-Keeper' && person.groundskeeperProfile && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Groundskeeper Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Experience</div>
                        <div className="font-medium">{person.groundskeeperProfile.experienceYears || 0} Years</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Matches Prepared</div>
                        <div className="font-medium">{person.groundskeeperProfile.matchesPrepared || 0}</div>
                      </div>
                    </div>
                  </Card>

                  {person.groundskeeperProfile.machineryLicenses && person.groundskeeperProfile.machineryLicenses.length > 0 && (
                     <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Machinery Licenses</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.groundskeeperProfile.machineryLicenses.map((license: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-primary/20 text-primary">
                            {license}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {person.groundskeeperProfile.primaryVenues && person.groundskeeperProfile.primaryVenues.length > 0 && (
                     <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Primary Venues</h3>
                      <div className="flex flex-wrap gap-2">
                        {person.groundskeeperProfile.primaryVenues.map((venue: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {venue}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3">
                  {person.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">Email</div>
                        <a href={`mailto:${person.email}`} className="text-sm hover:text-primary truncate block">
                          {person.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Phone</div>
                        <a href={`tel:${person.phone}`} className="text-sm hover:text-primary">
                          {person.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Specializations */}
              {person.specializations && person.specializations.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {person.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && isPlayer && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Career Statistics</h3>
              {person.stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Matches Played</div>
                    <div className="text-3xl font-bold">{person.stats.matchesPlayed || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Total Runs</div>
                    <div className="text-3xl font-bold">{person.stats.totalRuns || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Batting Average</div>
                    <div className="text-3xl font-bold">{person.stats.battingAverage?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Strike Rate</div>
                    <div className="text-3xl font-bold">{person.stats.strikeRate?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Wickets Taken</div>
                    <div className="text-3xl font-bold">{person.stats.wicketsTaken || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Bowling Average</div>
                    <div className="text-3xl font-bold">{person.stats.bowlingAverage?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Economy Rate</div>
                    <div className="text-3xl font-bold">{person.stats.economy?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Catches</div>
                    <div className="text-3xl font-bold">{person.stats.catches || 0}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No statistics available yet
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'skills' && isPlayer && (
          <SkillsManager 
            initialSkills={person.skillMatrix} 
            personId={person.id} 
          />
        )}

        {activeTab === 'performance' && isPlayer && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
            <div className="text-center py-12 text-muted-foreground">
              Performance charts and analysis coming soon
            </div>
          </Card>
        )}

        {activeTab === 'attributes' && isCoach && person.coachProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAttributeBlock('Coaching Attributes', person.coachProfile.coachingAttributes)}
            {renderAttributeBlock('Tactical Knowledge', person.coachProfile.tacticalAttributes)}
            {renderAttributeBlock('Man Management', person.coachProfile.manManagementAttributes)}
            {renderAttributeBlock('Professionalism', person.coachProfile.professionalAttributes)}
          </div>
        )}

        {activeTab === 'attributes' && person.role === 'Umpire' && person.umpireProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAttributeBlock('Decision Making', person.umpireProfile.decisionAttributes)}
            {renderAttributeBlock('Match Control', person.umpireProfile.matchControlAttributes)}
            {renderAttributeBlock('Physical', person.umpireProfile.physicalAttributes)}
          </div>
        )}

        {activeTab === 'attributes' && person.role === 'Scorer' && person.scorerProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAttributeBlock('Technical Skills', person.scorerProfile.technicalAttributes)}
            {renderAttributeBlock('Professionalism', person.scorerProfile.professionalAttributes)}
          </div>
        )}

        {activeTab === 'attributes' && ['Doctor', 'Physiotherapist', 'Trainer', 'First Aid'].includes(person.role || '') && person.medicalProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAttributeBlock('Clinical Skills', person.medicalProfile.clinicalAttributes)}
            {renderAttributeBlock('Rehabilitation', person.medicalProfile.rehabAttributes)}
          </div>
        )}

        {activeTab === 'attributes' && person.role === 'Grounds-Keeper' && person.groundskeeperProfile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAttributeBlock('Pitch Preparation', person.groundskeeperProfile.pitchAttributes)}
            {renderAttributeBlock('Outfield Management', person.groundskeeperProfile.outfieldAttributes)}
          </div>
        )}

        {activeTab === 'history' && isCoach && person.coachProfile && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Season History</h3>
              {person.coachProfile.coachSeasonStats && person.coachProfile.coachSeasonStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Season</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Team</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Matches</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Wins</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Losses</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Win %</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Titles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {person.coachProfile.coachSeasonStats.map((stat: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3">{stat.seasonId}</td>
                          <td className="py-3 font-medium">{stat.teamId}</td>
                          <td className="py-3 text-center">{stat.matches}</td>
                          <td className="py-3 text-center text-emerald-600 font-medium">{stat.wins}</td>
                          <td className="py-3 text-center text-red-600">{stat.losses}</td>
                          <td className="py-3 text-center font-bold">
                            {stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0}%
                          </td>
                          <td className="py-3 text-center">
                            {stat.titlesWon > 0 && (
                              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                {stat.titlesWon}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No season history recorded.
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-4">
            {relatedTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTeams.map(team => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-start gap-4">
                        {team.logoUrl && (
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                              src={team.logoUrl}
                              alt={team.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{team.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {team.divisionId || 'No division'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Teams</h3>
                <p className="text-muted-foreground">
                  This person is not currently assigned to any teams.
                </p>
              </Card>
            )}
          </div>
        )}
      </TabPanel>
    </div>
  );
}
