import { dc } from '@/lib/dataconnect';
import {
    listAgeDivisions,
    createAgeDivision,
    CreateAgeDivisionVariables,
    ListAgeDivisionsData
} from '@/generated/dataconnect';

export const ageDivisionService = {
    /**
     * Get all age divisions
     */
    async getAll(): Promise<ListAgeDivisionsData['ageDivisions']> {
        const response = await listAgeDivisions(dc);
        return response.data.ageDivisions;
    },

    /**
     * Create a new age division
     */
    async create(variables: CreateAgeDivisionVariables) {
        return createAgeDivision(dc, variables);
    }
};
