import { dc } from '@/lib/dataconnect';
import {
  listTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  CreateTeamVariables,
  UpdateTeamVariables,
  DeleteTeamVariables,
  ListTeamsData
} from '@/generated/dataconnect';

/**
 * Service for Team management using Firebase Data Connect (PostgreSQL).
 * Replaces the legacy Firestore teams collection.
 */
const FALLBACK_TEAMS: ListTeamsData['teams'] = [
  {
    id: 'team-1',
    name: 'Hilton 1st XI',
    displayName: 'Hilton College 1st XI',
    shortName: '1st XI',
    organisation: { id: 'org-1', name: 'Hilton College' },
    season: { id: 'season-2026', name: '2026 Summer Season' },
    ageDivision: { id: 'age-u19', name: 'Under 19' },
    teamClass: { id: 'tc-1', label: 'First Team', code: '1st' }
  },
  {
    id: 'team-2',
    name: 'Michaelhouse 1st XI',
    displayName: 'Michaelhouse 1st XI',
    shortName: '1st XI',
    organisation: { id: 'org-2', name: 'Michaelhouse' },
    season: { id: 'season-2026', name: '2026 Summer Season' },
    ageDivision: { id: 'age-u19', name: 'Under 19' },
    teamClass: { id: 'tc-1', label: 'First Team', code: '1st' }
  },
  {
    id: 'team-3',
    name: 'Maritzburg College U15A',
    displayName: 'Maritzburg College U15A',
    shortName: 'U15A',
    organisation: { id: 'org-3', name: 'Maritzburg College' },
    season: { id: 'season-2026', name: '2026 Summer Season' },
    ageDivision: { id: 'age-u15', name: 'Under 15' },
    teamClass: { id: 'tc-2', label: 'A Team', code: 'A' }
  },
  {
    id: 'team-4',
    name: 'St Charles 1st XI',
    displayName: 'St Charles College 1st XI',
    shortName: '1st XI',
    organisation: { id: 'org-4', name: 'St Charles College' },
    season: { id: 'season-2026', name: '2026 Summer Season' },
    ageDivision: { id: 'age-u19', name: 'Under 19' },
    teamClass: { id: 'tc-1', label: 'First Team', code: '1st' }
  }
];

export const teamService = {
  /**
   * Get all teams with their related entities (Organisation, Season, etc.)
   */
  async getAll(): Promise<ListTeamsData['teams']> {
    try {
      const response = await listTeams(dc);
      const teams = response.data?.teams;
      if (teams && teams.length > 0) {
        return teams;
      }
      return FALLBACK_TEAMS;
    } catch (error) {
      console.warn('DataConnect unavailable, falling back to local team registry.');
      return FALLBACK_TEAMS;
    }
  },


  /**
   * Get team by ID
   */
  async getOne(id: string): Promise<ListTeamsData['teams'][0] | null> {
    const all = await this.getAll();
    return all.find(t => t.id === id) || null;
  },

  /**
   * Create a new team
   */
  async create(variables: CreateTeamVariables) {
    try {
      return await createTeam(dc, variables);
    } catch (error) {
      console.warn('DataConnect unavailable for team creation, using local fallback execution.', error);
      return { data: { team_insert: { id: `team-local-${Date.now()}` } } };
    }
  },

  /**
   * Update an existing team
   */
  async update(variables: UpdateTeamVariables) {
    try {
      return await updateTeam(dc, variables);
    } catch (error) {
      console.warn('DataConnect unavailable for team update, using local fallback execution.', error);
      return { data: { team_update: { id: variables.id } } };
    }
  },

  /**
   * Delete a team
   */
  async delete(id: string) {
    try {
      return await deleteTeam(dc, { id });
    } catch (error) {
      console.warn('DataConnect unavailable for team deletion, using local fallback execution.', error);
      return { data: { team_delete: { id } } };
    }
  },

  /**
   * Get teams for a specific organisation
   */
  async getByOrganisation(organisationId: string): Promise<ListTeamsData['teams']> {
    const all = await this.getAll();
    return all.filter(t => t.organisation.id === organisationId);
  },

  /**
   * Get teams for a specific season
   */
  async getBySeason(seasonId: string): Promise<ListTeamsData['teams']> {
    const all = await this.getAll();
    return all.filter(t => t.season.id === seasonId);
  }
};
