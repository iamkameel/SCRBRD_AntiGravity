import { dc } from '@/lib/dataconnect';
import {
    listVenues,
    createVenue,
    CreateVenueVariables,
    ListVenuesData
} from '@/generated/dataconnect';

export const venueService = {
    /**
     * Get all venues
     */
    async getAll(): Promise<ListVenuesData['venues']> {
        const response = await listVenues(dc);
        return response.data?.venues || [];
    },

    /**
     * Create a new venue
     */
    async create(variables: CreateVenueVariables) {
        return createVenue(dc, variables);
    },

    /**
     * Get venues for a specific organisation
     */
    async getByOrganisation(organisationId: string): Promise<ListVenuesData['venues']> {
        const all = await this.getAll();
        return (all || []).filter(v => v.organisation?.id === organisationId);
    }
};
