import { dc } from '@/lib/dataconnect';
import {
    listTeamClasses,
    createTeamClass,
    CreateTeamClassVariables,
    ListTeamClassesData
} from '@/generated/dataconnect';

const FALLBACK_TEAM_CLASSES: ListTeamClassesData['teamClasses'] = [
    { id: 'tc-1', code: '1st', label: 'First XI' },
    { id: 'tc-2', code: '2nd', label: 'Second XI' },
    { id: 'tc-3', code: 'A', label: 'A Team' },
    { id: 'tc-4', code: 'B', label: 'B Team' }
];

export const teamClassService = {
    /**
     * Get all team classes
     */
    async getAll(): Promise<ListTeamClassesData['teamClasses']> {
        try {
            const response = await listTeamClasses(dc);
            const teamClasses = response.data?.teamClasses;
            if (teamClasses && teamClasses.length > 0) {
                return teamClasses;
            }
            return FALLBACK_TEAM_CLASSES;
        } catch (error) {
            console.warn('DataConnect unavailable, falling back to local team class registry.');
            return FALLBACK_TEAM_CLASSES;
        }
    },


    /**
     * Create a new team class
     */
    async create(variables: CreateTeamClassVariables) {
        return createTeamClass(dc, variables);
    }
};
