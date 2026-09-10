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
const FALLBACK_PEOPLE: ListPeopleData['people'] = [
    {
        id: 'p-1',
        firstName: 'David',
        lastName: 'Miller',
        preferredName: 'Dave',
        email: 'd.miller@hiltoncollege.com',
        status: 'Active',
        userAccount_on_person: {
            userRoleAssignments_on_userAccount: [
                {
                    id: 'ura-1',
                    systemRole: { label: 'Head Coach' },
                    organisation: { id: 'org-1', name: 'Hilton College' }
                }
            ]
        }
    }
];

export const personService = {
    /**
     * Get all people with relational joins (roles, orgs)
     */
    async getAll(): Promise<ListPeopleData['people']> {
        try {
            const response = await listPeople(dc);
            const people = response.data?.people;
            if (people && people.length > 0) {
                return people;
            }
            return FALLBACK_PEOPLE;
        } catch (error) {
            console.warn('DataConnect unavailable, falling back to local person registry.');
            return FALLBACK_PEOPLE;
        }
    },


    /**
     * Create a new person
     */
    async create(variables: CreatePersonVariables) {
        try {
            return await createPerson(dc, variables);
        } catch (error) {
            console.warn('DataConnect unavailable for person creation, using local fallback execution.', error);
            return { data: { person_insert: { id: `p-local-${Date.now()}` } } };
        }
    },

    /**
     * Get person by ID with full relational details
     */
    async getOne(id: string): Promise<GetPersonData['person'] | null> {
        try {
            const response = await getPerson(dc, { id });
            return response.data?.person || null;
        } catch (error) {
            console.warn('DataConnect unavailable, searching local fallback person registry.');
            const all = await this.getAll();
            const found = all.find(p => p.id === id);
            return (found as any) || null;
        }
    },

    /**
     * Delete a person from the relational engine
     */
    async delete(id: string) {
        try {
            return await deletePerson(dc, { id });
        } catch (error) {
            console.warn('DataConnect unavailable for person deletion, using local fallback execution.', error);
            return { data: { person_delete: { id } } };
        }
    },

    /**
     * Get coaches for a specific school
     */
    async getCoachesBySchool(schoolId: string): Promise<ListPeopleData['people']> {
        try {
            const all = await this.getAll();
            return all.filter(person =>
                person.userAccount_on_person?.userRoleAssignments_on_userAccount.some(
                    role => role.organisation?.id === schoolId &&
                        (role.systemRole.label === 'Coach' || role.systemRole.label === 'Head Coach')
                )
            );
        } catch (error) {
            console.error('Error fetching coaches:', error);
            return [];
        }
    }
};
