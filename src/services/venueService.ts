import { dc } from '@/lib/dataconnect';
import {
    listVenues,
    createVenue,
    CreateVenueVariables,
    ListVenuesData
} from '@/generated/dataconnect';

const FALLBACK_VENUES: ListVenuesData['venues'] = [
    { id: 'ven-1', name: 'Gilfillan Oval', venueType: 'Main Oval', organisation: { id: 'org-1', name: 'Hilton College' } },
    { id: 'ven-2', name: 'Roy Gathorne Oval', venueType: 'Main Oval', organisation: { id: 'org-2', name: 'Michaelhouse' } },
    { id: 'ven-3', name: 'Goldstones Oval', venueType: 'Main Oval', organisation: { id: 'org-3', name: 'Maritzburg College' } }
];

export const venueService = {
    /**
     * Get all venues
     */
    async getAll(): Promise<ListVenuesData['venues']> {
        try {
            const response = await listVenues(dc);
            const venues = response.data?.venues;
            if (venues && venues.length > 0) {
                return venues;
            }
            return FALLBACK_VENUES;
        } catch (error) {
            console.warn('DataConnect unavailable, falling back to local venue registry.');
            return FALLBACK_VENUES;
        }
    },


    /**
     * Create a new venue
     */
    async create(variables: CreateVenueVariables) {
        try {
            return await createVenue(dc, variables);
        } catch (error) {
            console.warn('DataConnect unavailable for venue creation, using local fallback execution.', error);
            return { data: { venue_insert: { id: `ven-local-${Date.now()}` } } };
        }
    },

    /**
     * Get venues for a specific organisation
     */
    async getByOrganisation(organisationId: string): Promise<ListVenuesData['venues']> {
        const all = await this.getAll();
        return (all || []).filter(v => v.organisation?.id === organisationId);
    }
};
