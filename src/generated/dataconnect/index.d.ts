import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AgeDivision_Key {
  id: UUIDString;
  __typename?: 'AgeDivision_Key';
}

export interface AuditLog_Key {
  id: UUIDString;
  __typename?: 'AuditLog_Key';
}

export interface BallEvent_Key {
  id: UUIDString;
  __typename?: 'BallEvent_Key';
}

export interface CommentaryEntry_Key {
  id: UUIDString;
  __typename?: 'CommentaryEntry_Key';
}

export interface CompetitionEntry_Key {
  id: UUIDString;
  __typename?: 'CompetitionEntry_Key';
}

export interface Competition_Key {
  id: UUIDString;
  __typename?: 'Competition_Key';
}

export interface CreateAgeDivisionData {
  ageDivision_insert: AgeDivision_Key;
}

export interface CreateAgeDivisionVariables {
  name: string;
  minAge?: number | null;
  maxAge?: number | null;
}

export interface CreateMatchData {
  match_insert: Match_Key;
}

export interface CreateMatchVariables {
  fixtureId: UUIDString;
}

export interface CreateOrganisationData {
  organisation_insert: Organisation_Key;
}

export interface CreateOrganisationVariables {
  name: string;
  organisationType: string;
  shortName?: string | null;
  slug: string;
}

export interface CreatePersonData {
  person_insert: Person_Key;
}

export interface CreatePersonVariables {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
}

export interface CreateSeasonData {
  season_insert: Season_Key;
}

export interface CreateSeasonVariables {
  name: string;
  startDate: DateString;
  endDate: DateString;
  isActive?: boolean | null;
}

export interface CreateTeamClassData {
  teamClass_insert: TeamClass_Key;
}

export interface CreateTeamClassVariables {
  code: string;
  label: string;
}

export interface CreateTeamData {
  team_insert: Team_Key;
}

export interface CreateTeamVariables {
  organisationId: UUIDString;
  seasonId: UUIDString;
  ageDivisionId: UUIDString;
  teamClassId: UUIDString;
  name: string;
  displayName?: string | null;
  shortName?: string | null;
}

export interface CreateVenueData {
  venue_insert: Venue_Key;
}

export interface CreateVenueVariables {
  organisationId: UUIDString;
  name: string;
  venueType?: string | null;
}

export interface DeletePersonData {
  person_delete?: Person_Key | null;
}

export interface DeletePersonVariables {
  id: UUIDString;
}

export interface DeleteTeamData {
  team_delete?: Team_Key | null;
}

export interface DeleteTeamVariables {
  id: UUIDString;
}

export interface Field_Key {
  id: UUIDString;
  __typename?: 'Field_Key';
}

export interface Fixture_Key {
  id: UUIDString;
  __typename?: 'Fixture_Key';
}

export interface GetPersonData {
  person?: {
    id: UUIDString;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    email?: string | null;
    phone?: string | null;
    profileImageUrl?: string | null;
    status?: string | null;
    userAccount_on_person?: {
      userRoleAssignments_on_userAccount: ({
        id: UUIDString;
        systemRole: {
          label: string;
        };
          organisation?: {
            id: UUIDString;
            name: string;
          } & Organisation_Key;
      } & UserRoleAssignment_Key)[];
    };
  } & Person_Key;
}

export interface GetPersonVariables {
  id: UUIDString;
}

export interface ImpactAttribution_Key {
  id: UUIDString;
  __typename?: 'ImpactAttribution_Key';
}

export interface ImpactModelVersion_Key {
  id: UUIDString;
  __typename?: 'ImpactModelVersion_Key';
}

export interface InjuryRecord_Key {
  id: UUIDString;
  __typename?: 'InjuryRecord_Key';
}

export interface InningsBattingScorecard_Key {
  id: UUIDString;
  __typename?: 'InningsBattingScorecard_Key';
}

export interface InningsBowlingScorecard_Key {
  id: UUIDString;
  __typename?: 'InningsBowlingScorecard_Key';
}

export interface InningsFallOfWicket_Key {
  id: UUIDString;
  __typename?: 'InningsFallOfWicket_Key';
}

export interface InningsMomentumSegment_Key {
  id: UUIDString;
  __typename?: 'InningsMomentumSegment_Key';
}

export interface InningsPartnership_Key {
  id: UUIDString;
  __typename?: 'InningsPartnership_Key';
}

export interface Innings_Key {
  id: UUIDString;
  __typename?: 'Innings_Key';
}

export interface Invoice_Key {
  id: UUIDString;
  __typename?: 'Invoice_Key';
}

export interface ListAgeDivisionsData {
  ageDivisions: ({
    id: UUIDString;
    name: string;
    minAge?: number | null;
    maxAge?: number | null;
  } & AgeDivision_Key)[];
}

export interface ListFixturesData {
  fixtures: ({
    id: UUIDString;
    scheduledStartAt: TimestampString;
    homeTeam: {
      name: string;
    };
      awayTeam: {
        name: string;
      };
        venue: {
          name: string;
        };
          status?: string | null;
  } & Fixture_Key)[];
}

export interface ListOrganisationsData {
  organisations: ({
    id: UUIDString;
    name: string;
    organisationType?: string | null;
    shortName?: string | null;
    slug: string;
    logoUrl?: string | null;
  } & Organisation_Key)[];
}

export interface ListPeopleData {
  people: ({
    id: UUIDString;
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    email?: string | null;
    phone?: string | null;
    profileImageUrl?: string | null;
    status?: string | null;
    userAccount_on_person?: {
      userRoleAssignments_on_userAccount: ({
        id: UUIDString;
        systemRole: {
          label: string;
        };
          organisation?: {
            id: UUIDString;
            name: string;
          } & Organisation_Key;
      } & UserRoleAssignment_Key)[];
    };
  } & Person_Key)[];
}

export interface ListSeasonsData {
  seasons: ({
    id: UUIDString;
    name: string;
    startDate: DateString;
    endDate: DateString;
    isActive?: boolean | null;
  } & Season_Key)[];
}

export interface ListTeamClassesData {
  teamClasses: ({
    id: UUIDString;
    code: string;
    label: string;
  } & TeamClass_Key)[];
}

export interface ListTeamsData {
  teams: ({
    id: UUIDString;
    name: string;
    displayName?: string | null;
    shortName?: string | null;
    organisation: {
      id: UUIDString;
      name: string;
    } & Organisation_Key;
      season: {
        id: UUIDString;
        name: string;
      } & Season_Key;
        ageDivision: {
          id: UUIDString;
          name: string;
        } & AgeDivision_Key;
          teamClass: {
            id: UUIDString;
            label: string;
            code: string;
          } & TeamClass_Key;
  } & Team_Key)[];
}

export interface ListVenuesData {
  venues: ({
    id: UUIDString;
    name: string;
    venueType?: string | null;
    organisation: {
      id: UUIDString;
      name: string;
    } & Organisation_Key;
  } & Venue_Key)[];
}

export interface MatchImpactEvent_Key {
  id: UUIDString;
  __typename?: 'MatchImpactEvent_Key';
}

export interface MatchInsight_Key {
  id: UUIDString;
  __typename?: 'MatchInsight_Key';
}

export interface MatchOfficialAssignment_Key {
  id: UUIDString;
  __typename?: 'MatchOfficialAssignment_Key';
}

export interface MatchTeamSheetPlayer_Key {
  id: UUIDString;
  __typename?: 'MatchTeamSheetPlayer_Key';
}

export interface MatchTeamSheet_Key {
  id: UUIDString;
  __typename?: 'MatchTeamSheet_Key';
}

export interface Match_Key {
  id: UUIDString;
  __typename?: 'Match_Key';
}

export interface MediaAsset_Key {
  id: UUIDString;
  __typename?: 'MediaAsset_Key';
}

export interface Notification_Key {
  id: UUIDString;
  __typename?: 'Notification_Key';
}

export interface Organisation_Key {
  id: UUIDString;
  __typename?: 'Organisation_Key';
}

export interface Over_Key {
  id: UUIDString;
  __typename?: 'Over_Key';
}

export interface PersonAddress_Key {
  id: UUIDString;
  __typename?: 'PersonAddress_Key';
}

export interface PersonDocument_Key {
  id: UUIDString;
  __typename?: 'PersonDocument_Key';
}

export interface PersonEmergencyContact_Key {
  id: UUIDString;
  __typename?: 'PersonEmergencyContact_Key';
}

export interface Person_Key {
  id: UUIDString;
  __typename?: 'Person_Key';
}

export interface PlayerAvailability_Key {
  id: UUIDString;
  __typename?: 'PlayerAvailability_Key';
}

export interface PlayerMatchImpact_Key {
  id: UUIDString;
  __typename?: 'PlayerMatchImpact_Key';
}

export interface PlayerMatchStats_Key {
  id: UUIDString;
  __typename?: 'PlayerMatchStats_Key';
}

export interface PlayerProfile_Key {
  id: UUIDString;
  __typename?: 'PlayerProfile_Key';
}

export interface PlayerSeasonStats_Key {
  id: UUIDString;
  __typename?: 'PlayerSeasonStats_Key';
}

export interface PotentialProjection_Key {
  id: UUIDString;
  __typename?: 'PotentialProjection_Key';
}

export interface RankingComponent_Key {
  id: UUIDString;
  __typename?: 'RankingComponent_Key';
}

export interface RankingSnapshot_Key {
  id: UUIDString;
  __typename?: 'RankingSnapshot_Key';
}

export interface ScoutReport_Key {
  id: UUIDString;
  __typename?: 'ScoutReport_Key';
}

export interface Season_Key {
  id: UUIDString;
  __typename?: 'Season_Key';
}

export interface SkillRating_Key {
  id: UUIDString;
  __typename?: 'SkillRating_Key';
}

export interface SystemRole_Key {
  id: UUIDString;
  __typename?: 'SystemRole_Key';
}

export interface TeamClass_Key {
  id: UUIDString;
  __typename?: 'TeamClass_Key';
}

export interface TeamHeadToHeadStats_Key {
  id: UUIDString;
  __typename?: 'TeamHeadToHeadStats_Key';
}

export interface TeamMembership_Key {
  id: UUIDString;
  __typename?: 'TeamMembership_Key';
}

export interface TeamSeasonStats_Key {
  id: UUIDString;
  __typename?: 'TeamSeasonStats_Key';
}

export interface Team_Key {
  id: UUIDString;
  __typename?: 'Team_Key';
}

export interface TrainingLog_Key {
  id: UUIDString;
  __typename?: 'TrainingLog_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface TransportTrip_Key {
  id: UUIDString;
  __typename?: 'TransportTrip_Key';
}

export interface UpdateTeamData {
  team_update?: Team_Key | null;
}

export interface UpdateTeamVariables {
  id: UUIDString;
  name?: string | null;
  displayName?: string | null;
  shortName?: string | null;
}

export interface UpsertFixtureData {
  fixture_upsert: Fixture_Key;
}

export interface UpsertFixtureVariables {
  id?: UUIDString | null;
  seasonId: UUIDString;
  homeTeamId: UUIDString;
  awayTeamId: UUIDString;
  venueId: UUIDString;
  scheduledStartAt: TimestampString;
}

export interface UserAccount_Key {
  id: UUIDString;
  __typename?: 'UserAccount_Key';
}

export interface UserRoleAssignment_Key {
  id: UUIDString;
  __typename?: 'UserRoleAssignment_Key';
}

export interface Vehicle_Key {
  id: UUIDString;
  __typename?: 'Vehicle_Key';
}

export interface Venue_Key {
  id: UUIDString;
  __typename?: 'Venue_Key';
}

interface CreatePersonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePersonVariables): MutationRef<CreatePersonData, CreatePersonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePersonVariables): MutationRef<CreatePersonData, CreatePersonVariables>;
  operationName: string;
}
export const createPersonRef: CreatePersonRef;

export function createPerson(vars: CreatePersonVariables): MutationPromise<CreatePersonData, CreatePersonVariables>;
export function createPerson(dc: DataConnect, vars: CreatePersonVariables): MutationPromise<CreatePersonData, CreatePersonVariables>;

interface DeletePersonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePersonVariables): MutationRef<DeletePersonData, DeletePersonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePersonVariables): MutationRef<DeletePersonData, DeletePersonVariables>;
  operationName: string;
}
export const deletePersonRef: DeletePersonRef;

export function deletePerson(vars: DeletePersonVariables): MutationPromise<DeletePersonData, DeletePersonVariables>;
export function deletePerson(dc: DataConnect, vars: DeletePersonVariables): MutationPromise<DeletePersonData, DeletePersonVariables>;

interface UpsertFixtureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertFixtureVariables): MutationRef<UpsertFixtureData, UpsertFixtureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertFixtureVariables): MutationRef<UpsertFixtureData, UpsertFixtureVariables>;
  operationName: string;
}
export const upsertFixtureRef: UpsertFixtureRef;

export function upsertFixture(vars: UpsertFixtureVariables): MutationPromise<UpsertFixtureData, UpsertFixtureVariables>;
export function upsertFixture(dc: DataConnect, vars: UpsertFixtureVariables): MutationPromise<UpsertFixtureData, UpsertFixtureVariables>;

interface CreateMatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMatchVariables): MutationRef<CreateMatchData, CreateMatchVariables>;
  operationName: string;
}
export const createMatchRef: CreateMatchRef;

export function createMatch(vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;
export function createMatch(dc: DataConnect, vars: CreateMatchVariables): MutationPromise<CreateMatchData, CreateMatchVariables>;

interface CreateOrganisationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrganisationVariables): MutationRef<CreateOrganisationData, CreateOrganisationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOrganisationVariables): MutationRef<CreateOrganisationData, CreateOrganisationVariables>;
  operationName: string;
}
export const createOrganisationRef: CreateOrganisationRef;

export function createOrganisation(vars: CreateOrganisationVariables): MutationPromise<CreateOrganisationData, CreateOrganisationVariables>;
export function createOrganisation(dc: DataConnect, vars: CreateOrganisationVariables): MutationPromise<CreateOrganisationData, CreateOrganisationVariables>;

interface CreateVenueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVenueVariables): MutationRef<CreateVenueData, CreateVenueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateVenueVariables): MutationRef<CreateVenueData, CreateVenueVariables>;
  operationName: string;
}
export const createVenueRef: CreateVenueRef;

export function createVenue(vars: CreateVenueVariables): MutationPromise<CreateVenueData, CreateVenueVariables>;
export function createVenue(dc: DataConnect, vars: CreateVenueVariables): MutationPromise<CreateVenueData, CreateVenueVariables>;

interface CreateSeasonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSeasonVariables): MutationRef<CreateSeasonData, CreateSeasonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSeasonVariables): MutationRef<CreateSeasonData, CreateSeasonVariables>;
  operationName: string;
}
export const createSeasonRef: CreateSeasonRef;

export function createSeason(vars: CreateSeasonVariables): MutationPromise<CreateSeasonData, CreateSeasonVariables>;
export function createSeason(dc: DataConnect, vars: CreateSeasonVariables): MutationPromise<CreateSeasonData, CreateSeasonVariables>;

interface CreateAgeDivisionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAgeDivisionVariables): MutationRef<CreateAgeDivisionData, CreateAgeDivisionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAgeDivisionVariables): MutationRef<CreateAgeDivisionData, CreateAgeDivisionVariables>;
  operationName: string;
}
export const createAgeDivisionRef: CreateAgeDivisionRef;

export function createAgeDivision(vars: CreateAgeDivisionVariables): MutationPromise<CreateAgeDivisionData, CreateAgeDivisionVariables>;
export function createAgeDivision(dc: DataConnect, vars: CreateAgeDivisionVariables): MutationPromise<CreateAgeDivisionData, CreateAgeDivisionVariables>;

interface CreateTeamClassRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeamClassVariables): MutationRef<CreateTeamClassData, CreateTeamClassVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTeamClassVariables): MutationRef<CreateTeamClassData, CreateTeamClassVariables>;
  operationName: string;
}
export const createTeamClassRef: CreateTeamClassRef;

export function createTeamClass(vars: CreateTeamClassVariables): MutationPromise<CreateTeamClassData, CreateTeamClassVariables>;
export function createTeamClass(dc: DataConnect, vars: CreateTeamClassVariables): MutationPromise<CreateTeamClassData, CreateTeamClassVariables>;

interface CreateTeamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTeamVariables): MutationRef<CreateTeamData, CreateTeamVariables>;
  operationName: string;
}
export const createTeamRef: CreateTeamRef;

export function createTeam(vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;
export function createTeam(dc: DataConnect, vars: CreateTeamVariables): MutationPromise<CreateTeamData, CreateTeamVariables>;

interface UpdateTeamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTeamVariables): MutationRef<UpdateTeamData, UpdateTeamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTeamVariables): MutationRef<UpdateTeamData, UpdateTeamVariables>;
  operationName: string;
}
export const updateTeamRef: UpdateTeamRef;

export function updateTeam(vars: UpdateTeamVariables): MutationPromise<UpdateTeamData, UpdateTeamVariables>;
export function updateTeam(dc: DataConnect, vars: UpdateTeamVariables): MutationPromise<UpdateTeamData, UpdateTeamVariables>;

interface DeleteTeamRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTeamVariables): MutationRef<DeleteTeamData, DeleteTeamVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTeamVariables): MutationRef<DeleteTeamData, DeleteTeamVariables>;
  operationName: string;
}
export const deleteTeamRef: DeleteTeamRef;

export function deleteTeam(vars: DeleteTeamVariables): MutationPromise<DeleteTeamData, DeleteTeamVariables>;
export function deleteTeam(dc: DataConnect, vars: DeleteTeamVariables): MutationPromise<DeleteTeamData, DeleteTeamVariables>;

interface ListPeopleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPeopleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPeopleData, undefined>;
  operationName: string;
}
export const listPeopleRef: ListPeopleRef;

export function listPeople(): QueryPromise<ListPeopleData, undefined>;
export function listPeople(dc: DataConnect): QueryPromise<ListPeopleData, undefined>;

interface GetPersonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPersonVariables): QueryRef<GetPersonData, GetPersonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPersonVariables): QueryRef<GetPersonData, GetPersonVariables>;
  operationName: string;
}
export const getPersonRef: GetPersonRef;

export function getPerson(vars: GetPersonVariables): QueryPromise<GetPersonData, GetPersonVariables>;
export function getPerson(dc: DataConnect, vars: GetPersonVariables): QueryPromise<GetPersonData, GetPersonVariables>;

interface ListFixturesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListFixturesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListFixturesData, undefined>;
  operationName: string;
}
export const listFixturesRef: ListFixturesRef;

export function listFixtures(): QueryPromise<ListFixturesData, undefined>;
export function listFixtures(dc: DataConnect): QueryPromise<ListFixturesData, undefined>;

interface ListOrganisationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOrganisationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListOrganisationsData, undefined>;
  operationName: string;
}
export const listOrganisationsRef: ListOrganisationsRef;

export function listOrganisations(): QueryPromise<ListOrganisationsData, undefined>;
export function listOrganisations(dc: DataConnect): QueryPromise<ListOrganisationsData, undefined>;

interface ListVenuesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVenuesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListVenuesData, undefined>;
  operationName: string;
}
export const listVenuesRef: ListVenuesRef;

export function listVenues(): QueryPromise<ListVenuesData, undefined>;
export function listVenues(dc: DataConnect): QueryPromise<ListVenuesData, undefined>;

interface ListSeasonsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSeasonsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSeasonsData, undefined>;
  operationName: string;
}
export const listSeasonsRef: ListSeasonsRef;

export function listSeasons(): QueryPromise<ListSeasonsData, undefined>;
export function listSeasons(dc: DataConnect): QueryPromise<ListSeasonsData, undefined>;

interface ListAgeDivisionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAgeDivisionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAgeDivisionsData, undefined>;
  operationName: string;
}
export const listAgeDivisionsRef: ListAgeDivisionsRef;

export function listAgeDivisions(): QueryPromise<ListAgeDivisionsData, undefined>;
export function listAgeDivisions(dc: DataConnect): QueryPromise<ListAgeDivisionsData, undefined>;

interface ListTeamClassesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTeamClassesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListTeamClassesData, undefined>;
  operationName: string;
}
export const listTeamClassesRef: ListTeamClassesRef;

export function listTeamClasses(): QueryPromise<ListTeamClassesData, undefined>;
export function listTeamClasses(dc: DataConnect): QueryPromise<ListTeamClassesData, undefined>;

interface ListTeamsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTeamsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListTeamsData, undefined>;
  operationName: string;
}
export const listTeamsRef: ListTeamsRef;

export function listTeams(): QueryPromise<ListTeamsData, undefined>;
export function listTeams(dc: DataConnect): QueryPromise<ListTeamsData, undefined>;

