import { fetchDocument, fetchPlayersForMatch, fetchPlayerMatchImpact, fetchMatchImpactEvents } from "@/lib/firestore";
import { Match, Team, Person } from "@/types/firestore";
import { MatchDetailClient } from "@/components/match/MatchDetailClient";
import { serializeFirestoreData } from "@/lib/utils/serializeFirestore";
import { getMockMatch, getMockSquad } from "@/lib/mockMatchData";

export default async function MatchDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  let matchRaw = await fetchDocument<Match>('matches', id);
  let homeTeamRaw: Team | null = null;
  let awayTeamRaw: Team | null = null;
  let playersRaw: Person[] = [];
  let playerImpactRaw: any[] = [];
  let matchImpactEventsRaw: any[] = [];

  if (!matchRaw) {
    const mock = getMockMatch(id);
    matchRaw = {
      id: mock.id || id,
      homeTeamId: 'wbhs-1st-xi',
      awayTeamId: 'kc-1st-xi',
      homeTeamName: mock.homeTeamName,
      awayTeamName: mock.awayTeamName,
      location: mock.venue,
      venue: mock.venue,
      field: mock.field,
      matchType: mock.matchType,
      division: mock.division,
      status: mock.state === 'LIVE' ? 'live' : mock.state === 'COMPLETED' ? 'completed' : 'scheduled',
      state: mock.state,
      matchDate: new Date().toISOString(),
      dateTime: new Date().toISOString(),
      currentInningsNumber: mock.currentInnings,
      inningsData: {
        firstInnings: {
          teamId: 'wbhs-1st-xi',
          runs: mock.liveScore.totalRuns,
          wickets: mock.liveScore.wickets,
          overs: `${mock.liveScore.overs}.${mock.liveScore.ballsInOver}`,
          battingCard: [
            { playerId: 'wbhs-1', runs: mock.liveScore.striker.runs, balls: mock.liveScore.striker.balls, fours: mock.liveScore.striker.fours, sixes: mock.liveScore.striker.sixes, dismissal: 'not out', isOut: false },
            { playerId: 'wbhs-2', runs: mock.liveScore.nonStriker.runs, balls: mock.liveScore.nonStriker.balls, fours: mock.liveScore.nonStriker.fours, sixes: mock.liveScore.nonStriker.sixes, dismissal: 'not out', isOut: false },
            { playerId: 'wbhs-3', runs: 32, balls: 28, fours: 4, sixes: 1, dismissal: 'c Montgomery b Anderson', isOut: true },
            { playerId: 'wbhs-4', runs: 18, balls: 22, fours: 2, sixes: 0, dismissal: 'b Wright', isOut: true },
          ],
          bowlingCard: [
            { playerId: 'kc-1', overs: mock.liveScore.currentBowler.overs, oversBowled: 7.4, maidens: mock.liveScore.currentBowler.maidens, runs: mock.liveScore.currentBowler.runs, wickets: mock.liveScore.currentBowler.wickets },
            { playerId: 'kc-2', overs: '8.0', oversBowled: 8.0, maidens: 0, runs: 42, wickets: 1 },
            { playerId: 'kc-3', overs: '7.0', oversBowled: 7.0, maidens: 1, runs: 35, wickets: 0 }
          ],
          overHistory: [
            { overNumber: 30, runs: 8, wickets: 0 },
            { overNumber: 31, runs: 12, wickets: 0 },
            { overNumber: 32, runs: 4, wickets: 1 },
            { overNumber: 33, runs: 9, wickets: 0 },
            { overNumber: 34, runs: 11, wickets: 0 },
          ]
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as Match;

    homeTeamRaw = {
      id: 'wbhs-1st-xi',
      name: mock.homeTeamName,
      schoolId: 'wbhs',
      seasonId: '2026',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Team;

    awayTeamRaw = {
      id: 'kc-1st-xi',
      name: mock.awayTeamName,
      schoolId: 'kc',
      seasonId: '2026',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Team;

    playersRaw = [...getMockSquad(mock.homeTeamName), ...getMockSquad(mock.awayTeamName)] as Person[];
  } else {
    homeTeamRaw = await fetchDocument<Team>('teams', matchRaw.homeTeamId);
    awayTeamRaw = await fetchDocument<Team>('teams', matchRaw.awayTeamId);
    playersRaw = await fetchPlayersForMatch(matchRaw.homeTeamId, matchRaw.awayTeamId);
    playerImpactRaw = await fetchPlayerMatchImpact(id);
    matchImpactEventsRaw = await fetchMatchImpactEvents(id, 10);
  }

  // Serialize data for Client Component
  const match = serializeFirestoreData(matchRaw);
  const homeTeam = homeTeamRaw ? serializeFirestoreData(homeTeamRaw) : undefined;
  const awayTeam = awayTeamRaw ? serializeFirestoreData(awayTeamRaw) : undefined;
  const players = playersRaw.map(p => serializeFirestoreData(p));
  const playerImpact = playerImpactRaw.map(pi => serializeFirestoreData(pi));
  const matchImpactEvents = matchImpactEventsRaw.map(me => serializeFirestoreData(me));

  return (
    <MatchDetailClient 
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      players={players}
      playerImpact={playerImpact}
      matchImpactEvents={matchImpactEvents}
    />
  );
}

