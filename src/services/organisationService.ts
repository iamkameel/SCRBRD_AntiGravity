import { dc } from '@/lib/dataconnect';
import {
    listOrganisations,
    createOrganisation,
    CreateOrganisationVariables,
    ListOrganisationsData
} from '@/generated/dataconnect';

export const organisationService = {
    /**
     * Get all organisations
     */
    async getAll(): Promise<ListOrganisationsData['organisations']> {
        const response = await listOrganisations(dc);
        return response.data?.organisations || [];
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
