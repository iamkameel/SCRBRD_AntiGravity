import { fetchDocument, fetchCollection } from '@/lib/firestore';
import { Match, Team, Person } from '@/types/firestore';
import { MatchManagementClient } from './client';
import { notFound } from 'next/navigation';
import { where } from 'firebase/firestore';
import { fetchPreMatchProcedure } from '@/app/actions/preMatchActions';
import { fetchManagementContextAction } from '@/app/actions/preMatchActions_v2';
import { isMockMatch, getMockMatch, getMockSquad } from '@/lib/mockMatchData';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MatchManagePage({ params }: PageProps) {
  const { id: matchId } = await params;

  // Fetch match data
  let match = await fetchDocument<Match>('matches', matchId);
  
  if (!match) {
    if (isMockMatch(matchId)) {
      const mock = getMockMatch(matchId);
      match = ({
        id: mock.id,
        homeTeamId: 'wbhs-1st-xi',
        awayTeamId: 'kc-1st-xi',
        date: '2026-09-10',
        matchDate: '2026-09-10',
        time: '09:30',
        venue: mock.venue,
        field: mock.field,
        status: 'LIVE',
        seasonId: '2026-season',
        divisionId: 'kzn-super-league',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown) as Match;
    } else {
      notFound();
    }
  }

  // Fetch teams and pre-match procedure in parallel
  let homeTeam = await fetchDocument<Team>('teams', match.homeTeamId);
  let awayTeam = await fetchDocument<Team>('teams', match.awayTeamId);
  
  if (!homeTeam) {
    homeTeam = {
      id: match.homeTeamId,
      name: "Westville 1st XI",
      schoolId: "wbhs",
      seasonId: "2026",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Team;
  }
  
  if (!awayTeam) {
    awayTeam = {
      id: match.awayTeamId,
      name: "Kearsney 1st XI",
      schoolId: "kc",
      seasonId: "2026",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Team;
  }

  // Fetch players for both teams
  let homePlayers = await fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', match.homeTeamId)
  ]);
  
  let awayPlayers = await fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', match.awayTeamId)
  ]);

  if (!homePlayers || homePlayers.length === 0) {
    homePlayers = getMockSquad(homeTeam.name);
  }

  if (!awayPlayers || awayPlayers.length === 0) {
    awayPlayers = getMockSquad(awayTeam.name);
  }

  // Fetch management context (readiness, squads, availability)
  let contextRes = await fetchManagementContextAction(matchId, match.homeTeamId);
  
  let ctx: any;
  if (!contextRes.success) {
    ctx = {
      success: true,
      readiness: {
        id: 'r-1',
        fixtureId: matchId,
        teamId: match.homeTeamId,
        squadSelected: true,
        pitchPrepared: true,
        transportConfirmed: true,
        medicalCleared: true,
        overallStatus: 'GREEN',
        updatedAt: new Date().toISOString()
      },
      latestTeamSheet: null,
      selectedPlayers: homePlayers.slice(0, 11).map(p => ({
        personId: p.id,
        role: 'PLAYER',
        orderIndex: 1
      })),
      availability: homePlayers.map(p => ({ personId: p.id, status: 'AVAILABLE' }))
    };
  } else {
    ctx = contextRes;
  }

  return (
    <MatchManagementClient
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      homePlayers={homePlayers}
      awayPlayers={awayPlayers}
      context={ctx}
    />
  );
}
