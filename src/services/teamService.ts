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
export const teamService = {
  /**
   * Get all teams with their related entities (Organisation, Season, etc.)
   */
  async getAll(): Promise<ListTeamsData['teams']> {
    const response = await listTeams(dc);
    return response.data.teams;
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
    return createTeam(dc, variables);
  },

  /**
   * Update an existing team
   */
  async update(variables: UpdateTeamVariables) {
    return updateTeam(dc, variables);
  },

  /**
   * Delete a team
   */
  async delete(id: string) {
    return deleteTeam(dc, { id });
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
