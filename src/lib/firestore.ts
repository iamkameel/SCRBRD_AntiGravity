import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  documentId,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import {
  Team,
  School,
  Division,
  Person,
  Match,
  RosterMember,
  Season
} from '@/types/firestore';
import { normalizePerson, normalizePeople } from './normalizePerson';

/**
 * Generic function to fetch a collection from Firestore with optional constraints.
 * 
 * @template T - The type of documents in the collection
 * @param collectionName - The name of the Firestore collection
 * @param constraints - Optional array of QueryConstraints (where, orderBy, limit, etc.)
 * @param normalize - Whether to normalize the data (specific to 'people' collection)
 * @returns Promise resolving to an array of documents of type T
 */
export async function fetchCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  normalize: boolean = false
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];

    // Normalize Person data if requested
    if (normalize && collectionName === 'people') {
      return normalizePeople(data as any) as T[];
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

export async function fetchDocument<T>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  if (!collectionName || !documentId) {
    console.warn(`fetchDocument called with invalid collectionName (${collectionName}) or documentId (${documentId})`);
    return null;
  }
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${documentId} from ${collectionName}:`, error);
    return null;
  }
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string | null> {
  if (!collectionName) return null;
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<boolean> {
  if (!collectionName || !documentId) return false;
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error(`Error setting document ${documentId} in ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<boolean> {
  if (!collectionName || !documentId) return false;
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef as any, data as any);
    return true;
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  if (!collectionName || !documentId) return false;
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
}

// Specific data fetchers
export async function fetchTeams() {
  return fetchCollection<Team>('teams', [orderBy('name')]);
}

export async function fetchTeamById(id: string) {
  return fetchDocument<Team>('teams', id);
}

export async function fetchMatches(limitCount = 50) {
  return fetchCollection<Match>('matches', [
    orderBy('dateTime', 'desc'),
    limit(limitCount)
  ]);
}

export async function fetchLiveMatches() {
  return fetchCollection<Match>('matches', [
    where('status', '==', 'live'),
    orderBy('dateTime', 'desc')
  ]);
}

export async function fetchUpcomingMatches(limitCount = 10) {
  const now = new Date().toISOString();
  return fetchCollection<Match>('matches', [
    where('dateTime', '>=', now),
    where('status', '==', 'scheduled'),
    orderBy('dateTime', 'asc'),
    limit(limitCount)
  ]);
}

export async function fetchMatchById(id: string) {
  return fetchDocument<Match>('matches', id);
}

export async function fetchMatchesByDateRange(startDate: Date, endDate: Date) {
  return fetchCollection<Match>('matches', [
    where('dateTime', '>=', startDate.toISOString()),
    where('dateTime', '<=', endDate.toISOString())
  ]);
}


export async function fetchPlayers(limitCount = 100) {
  return fetchCollection<Person>('people', [
    where('role', '==', 'Player'),
    orderBy('lastName'),
    limit(limitCount)
  ]);
}

export async function fetchPersonById(id: string) {
  // getDoc misbehaves in Next.js server components with Firebase v12, so this
  // goes through getDocs — but filtered to the one document, not the whole
  // collection.
  try {
    const [person] = await fetchCollection<any>('people', [where(documentId(), '==', id), limit(1)], false);
    return person ? normalizePerson(person) : null;
  } catch (error) {
    console.error(`Error fetching person by ID ${id}:`, error);
    return null;
  }
}

export async function fetchSchools() {
  return fetchCollection<School>('schools', [orderBy('name')]);
}

export async function fetchSchoolById(id: string) {
  return fetchDocument<School>('schools', id);
}

export async function fetchLeagues() {
  return fetchCollection<any>('leagues', [orderBy('name')]);
}

export async function fetchDivisions() {
  return fetchCollection<Division>('divisions', [orderBy('name')]);
}

export async function fetchDivisionById(id: string) {
  return fetchDocument<Division>('divisions', id);
}

export async function fetchFields() {
  return fetchCollection('fields', [orderBy('name')]);
}

export async function fetchFieldById(id: string) {
  return fetchDocument<any>('fields', id);
}

export async function fetchTransactions(limitCount = 50) {
  return fetchCollection('transactions', [
    orderBy('date', 'desc'),
    limit(limitCount)
  ]);
}

export async function fetchTrips(limitCount = 50) {
  return fetchCollection('trips', [
    orderBy('date', 'desc'),
    limit(limitCount)
  ]);
}

export async function fetchVehicles() {
  return fetchCollection('vehicles', [orderBy('name')]);
}

export async function fetchEquipment() {
  return fetchCollection('equipment', [orderBy('name')]);
}

export async function fetchSeasons() {
  return fetchCollection<Season>('seasons', [orderBy('startDate', 'desc')]);
}

export async function fetchSeasonById(id: string) {
  return fetchDocument<Season>('seasons', id);
}

export async function fetchSchoolStaff(schoolId: string) {
  return fetchCollection<any>('staffProfiles', [
    where('schoolId', '==', schoolId)
  ]);
}

export async function fetchSchoolNews(schoolId: string) {
  return fetchCollection<any>('newsPosts', [
    where('schoolId', '==', schoolId),
    orderBy('date', 'desc'),
    limit(5)
  ]);
}

export async function fetchSchoolStats(schoolId: string) {
  // In a real app, this might be a single document. 
  // For now, we'll try to fetch a specific stats doc or calculate it.
  // Let's assume there's a 'schoolStats' collection.
  const stats = await fetchCollection<any>('schoolStats', [
    where('schoolId', '==', schoolId),
    limit(1)
  ]);
  return stats.length > 0 ? stats[0] : null;
}

// Helper functions
export async function getTeamsBySchool(schoolId: string) {
  return fetchCollection<Team>('teams', [
    where('schoolId', '==', schoolId),
    orderBy('name')
  ]);
}

export async function getPeopleBySchool(schoolId: string) {
  const rawData = await fetchCollection<any>('people', [
    where('schoolId', '==', schoolId),
    orderBy('lastName')
  ]);
  return normalizePeople(rawData);
}

export async function fetchCoachesBySchool(schoolId: string) {
  const people = await getPeopleBySchool(schoolId);
  const coachRoles = ['Coach', 'Assistant Coach', 'Head Coach', 'Trainer'];

  return people.filter(person => {
    const personRole = person.role || '';
    return coachRoles.some(role =>
      personRole.toLowerCase().includes(role.toLowerCase())
    );
  });
}


export async function getPlayersByTeam(teamId: string) {
  return fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', teamId),
    orderBy('lastName')
  ]);
}

export async function getRosterByTeam(teamId: string) {
  return fetchCollection<RosterMember>('roster', [
    where('teamId', '==', teamId)
  ]);
}

export async function getMatchesByTeam(teamId: string) {
  const [homeMatches, awayMatches] = await Promise.all([
    fetchCollection<Match>('matches', [where('homeTeamId', '==', teamId)]),
    fetchCollection<Match>('matches', [where('awayTeamId', '==', teamId)])
  ]);

  const allMatches = [...homeMatches, ...awayMatches];
  return allMatches.sort((a, b) => {
    const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
    const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
    return dateB - dateA;
  });
}

export async function fetchSponsors() {
  return fetchCollection<any>('sponsors', [orderBy('name')]);
}

export async function fetchTopRunScorers(limitCount = 10) {
  // Note: Requires composite index on 'role' and 'stats.totalRuns'
  return fetchCollection<Person>('people', [
    where('role', '==', 'Player'),
    orderBy('stats.totalRuns', 'desc'),
    limit(limitCount)
  ]);
}

export async function fetchTopWicketTakers(limitCount = 10) {
  // Note: Requires composite index on 'role' and 'stats.wicketsTaken'
  return fetchCollection<Person>('people', [
    where('role', '==', 'Player'),
    orderBy('stats.wicketsTaken', 'desc'),
    limit(limitCount)
  ]);
}

export async function fetchLeagueStandings() {
  // TODO: Implement real standings calculation or fetch from a 'standings' collection
  // For now, returning mock data to facilitate migration
  return [
    { team: { id: "t1", name: "Royal Challengers", teamColors: { primary: "#FF0000" } }, played: 10, won: 7, lost: 3, points: 14 },
    { team: { id: "t2", name: "Mumbai Indians", teamColors: { primary: "#005DA0" } }, played: 10, won: 6, lost: 4, points: 12 },
    { team: { id: "t3", name: "Capitals", teamColors: { primary: "#282968" } }, played: 10, won: 5, lost: 5, points: 10 },
    { team: { id: "t4", name: "Super Kings", teamColors: { primary: "#FDB913" } }, played: 10, won: 4, lost: 6, points: 8 },
  ];
}

export async function fetchActiveSeason() {
  const seasons = await fetchCollection<Season>('seasons', [
    where('active', '==', true),
    limit(1)
  ]);
  return seasons[0] || null;
}


export async function findUserByEmail(email: string) {
  return fetchCollection<any>('users', [
    where('email', '==', email)
  ]);
}

export async function fetchPlayersForMatch(homeTeamId: string, awayTeamId: string) {
  // Fetch players who belong to either team
  // Note: 'teamIds' is an array field in Person
  return fetchCollection<Person>('people', [
    where('teamIds', 'array-contains-any', [homeTeamId, awayTeamId])
  ]);
}

export async function fetchUmpires() {
  return fetchCollection<Person>('people', [
    where('role', '==', 'Umpire'),
    orderBy('lastName')
  ]);
}

export async function fetchScorers() {
  return fetchCollection<Person>('people', [
    where('role', '==', 'Scorer'),
    orderBy('lastName')
  ]);
}

export async function getMatchesByOfficial(officialId: string) {
  return fetchCollection<Match>('matches', [
    where('umpires', 'array-contains', officialId),
    orderBy('matchDate', 'desc'),
    limit(10)
  ]);
}

export async function getMatchesByScorer(scorerId: string) {
  return fetchCollection<Match>('matches', [
    where('scorer', '==', scorerId),
    orderBy('matchDate', 'desc'),
    limit(10)
  ]);
}

export async function fetchPlayerMatchImpact(fixtureId: string) {
  return fetchCollection<any>('player_match_impact', [
    where('fixtureId', '==', fixtureId),
    orderBy('totalImpact', 'desc')
  ]);
}

export async function fetchMatchImpactEvents(fixtureId: string, limitCount = 10) {
  return fetchCollection<any>('match_impact_events', [
    where('fixtureId', '==', fixtureId),
    orderBy('totalImpactValue', 'desc'),
    limit(limitCount)
  ]);
}
