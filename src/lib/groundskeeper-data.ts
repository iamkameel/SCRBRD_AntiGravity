// Groundskeeper data fetching from Firestore
// Replaces legacy mock data with real database queries

import { fetchCollection, fetchDocument } from './firestore';
import { Player as Person } from '@/lib/store';
import { where, orderBy } from 'firebase/firestore';

export interface AssignedField {
    id: string;
    fieldName: string;
    location?: string;
    condition?: string;
}

export interface GroundskeeperProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    expertiseAreas: string[];
    experienceYears: number;
    assignedFields: AssignedField[];
    certifications?: string[];
}

// Convert Person to GroundskeeperProfile format
function personToGroundskeeperProfile(person: Person): GroundskeeperProfile {
    const fullName = `${person.firstName} ${person.lastName}`;

    return {
        id: person.id,
        name: fullName,
        email: person.email,
        phone: person.phone,
        avatar: person.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=16a34a&color=fff`,
        bio: undefined,
        expertiseAreas: person.specializations || ['Ground Maintenance'],
        experienceYears: person.stats?.matchesPlayed ? Math.floor(person.stats.matchesPlayed / 10) : 0,
        assignedFields: [], // Would be populated from field assignments
        certifications: person.specializations,
    };
}

// Empty array for backward compatibility
export const groundkeepersData: GroundskeeperProfile[] = [];

// Fetch all groundskeepers
export async function fetchGroundskeepers(): Promise<GroundskeeperProfile[]> {
    try {
        const people = await fetchCollection<Person>('people', [
            where('role', '==', 'Groundskeeper'),
            orderBy('lastName')
        ]);
        return people.map(personToGroundskeeperProfile);
    } catch (error) {
        console.error('Error fetching groundskeepers:', error);
        return [];
    }
}

// Fetch a single groundskeeper by ID
export async function fetchGroundskeeperById(id: string): Promise<GroundskeeperProfile | null> {
    try {
        const person = await fetchDocument<Person>('people', id);
        if (!person) return null;

        // Check if this person is a groundskeeper
        if (person.role !== 'Groundskeeper') {
            console.warn(`Person ${id} is not a groundskeeper`);
            return null;
        }

        return personToGroundskeeperProfile(person);
    } catch (error) {
        console.error('Error fetching groundskeeper:', error);
        return null;
    }
}
