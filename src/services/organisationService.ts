import { dc } from '@/lib/dataconnect';
import {
    listOrganisations,
    createOrganisation,
    CreateOrganisationVariables,
    ListOrganisationsData
} from '@/generated/dataconnect';

const FALLBACK_ORGANISATIONS: ListOrganisationsData['organisations'] = [
    { id: 'org-1', name: 'Hilton College', organisationType: 'School', shortName: 'Hilton', slug: 'hilton-college', logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150' },
    { id: 'org-2', name: 'Michaelhouse', organisationType: 'School', shortName: 'MHS', slug: 'michaelhouse', logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150' },
    { id: 'org-3', name: 'Maritzburg College', organisationType: 'School', shortName: 'College', slug: 'maritzburg-college', logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150' },
    { id: 'org-4', name: 'St Charles College', organisationType: 'School', shortName: 'SCC', slug: 'st-charles-college', logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150' },
    { id: 'org-5', name: 'Durban High School', organisationType: 'School', shortName: 'DHS', slug: 'durban-high-school', logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150' },
    { id: 'org-6', name: 'Kearsney College', organisationType: 'School', shortName: 'Kearsney', slug: 'kearsney-college', logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150' }
];

export const organisationService = {
    /**
     * Get all organisations
     */
    async getAll(): Promise<ListOrganisationsData['organisations']> {
        try {
            const response = await listOrganisations(dc);
            const orgs = response.data?.organisations;
            if (orgs && orgs.length > 0) {
                return orgs;
            }
            return FALLBACK_ORGANISATIONS;
        } catch (error) {
            console.warn('DataConnect unavailable, falling back to local organisation registry.');
            return FALLBACK_ORGANISATIONS;
        }
    },


    /**
     * Create a new organisation
     */
    async create(variables: CreateOrganisationVariables) {
        return createOrganisation(dc, variables);
    },

    /**
     * Get organisations by type (e.g., 'School')
     */
    async getByType(type: string): Promise<ListOrganisationsData['organisations']> {
        const all = await this.getAll();
        return (all || []).filter(org => org.organisationType === type);
    },

    /**
     * Get all schools
     */
    async getSchools(): Promise<ListOrganisationsData['organisations']> {
        return this.getByType('School');
    }
};
