import { dc, isDataConnectEnabled, disableDataConnect } from '@/lib/dataconnect';
import {
    listAgeDivisions,
    createAgeDivision,
    CreateAgeDivisionVariables,
    ListAgeDivisionsData
} from '@/generated/dataconnect';

const FALLBACK_AGE_DIVISIONS: ListAgeDivisionsData['ageDivisions'] = [
    { id: 'age-u19', name: 'Under 19', minAge: 16, maxAge: 19 },
    { id: 'age-u16', name: 'Under 16', minAge: 15, maxAge: 16 },
    { id: 'age-u15', name: 'Under 15', minAge: 14, maxAge: 15 },
    { id: 'age-u14', name: 'Under 14', minAge: 13, maxAge: 14 }
];

export const ageDivisionService = {
    /**
     * Get all age divisions
     */
    async getAll(): Promise<ListAgeDivisionsData['ageDivisions']> {
        if (!isDataConnectEnabled()) {
            return FALLBACK_AGE_DIVISIONS;
        }
        try {
            const response = await listAgeDivisions(dc);
            const divisions = response.data?.ageDivisions;
            if (divisions && divisions.length > 0) {
                return divisions;
            }
            return FALLBACK_AGE_DIVISIONS;
        } catch (error) {
            disableDataConnect();
            console.warn('DataConnect unavailable, falling back to local age division registry.');
            return FALLBACK_AGE_DIVISIONS;
        }
    },


    /**
     * Create a new age division
     */
    async create(variables: CreateAgeDivisionVariables) {
        return createAgeDivision(dc, variables);
    }
};
