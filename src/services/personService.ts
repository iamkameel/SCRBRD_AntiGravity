import { dc } from '@/lib/dataconnect';
import {
    listPeople,
    createPerson,
    getPerson,
    deletePerson,
    CreatePersonVariables,
    ListPeopleData,
    GetPersonData
} from '@/generated/dataconnect';

/**
 * Service for Person management using Firebase Data Connect (PostgreSQL).
 * Replaces the legacy Firestore people collection.
 */
export const personService = {
    /**
     * Get all people with relational joins (roles, orgs)
     */
    async getAll(): Promise<ListPeopleData['people']> {
        const response = await listPeople(dc);
        return response.data?.people || [];
    },

    /**
     * Create a new person
     */
    async create(variables: CreatePersonVariables) {
        return createPerson(dc, variables);
    },

    /**
     * Get person by ID with full relational details
     */
    async getOne(id: string): Promise<GetPersonData['person'] | null> {
        const response = await getPerson(dc, { id });
        return response.data?.person || null;
    },

    /**
     * Delete a person from the relational engine
     */
    async delete(id: string) {
        return deletePerson(dc, { id });
    }
};
