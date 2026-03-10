import { dc } from '@/lib/dataconnect';
import {
    listTeamClasses,
    createTeamClass,
    CreateTeamClassVariables,
    ListTeamClassesData
} from '@/generated/dataconnect';

export const teamClassService = {
    /**
     * Get all team classes
     */
    async getAll(): Promise<ListTeamClassesData['teamClasses']> {
        const response = await listTeamClasses(dc);
        return response.data.teamClasses;
    },

    /**
     * Create a new team class
     */
    async create(variables: CreateTeamClassVariables) {
        return createTeamClass(dc, variables);
    }
};
