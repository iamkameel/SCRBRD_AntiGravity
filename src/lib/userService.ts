import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Player } from '@/lib/store';
import { personService } from '@/services/personService';

export interface UserData extends Omit<Player, 'status' | 'personId' | 'createdAt' | 'updatedAt'> {
    uid: string;
    email: string;
    role: string; // Primary role
    roles?: string[]; // Multiple roles
    assignedSchools?: string[]; // Array of school IDs
    teamIds?: string[]; // Array of team IDs
    displayName: string;
    photoURL?: string;
    hasAccount?: boolean;
    personId?: string;
    status: 'active' | 'inactive' | 'injured' | 'suspended';
    lastLogin?: string | number;
    createdAt?: string;
    updatedAt?: string;
}

export interface InvitationData {
    id: string;
    email: string;
    role: string;
    roles?: string[];
    assignedSchools?: string[];
    teamIds?: string[];
    status: 'pending' | 'accepted' | 'expired';
    invitedBy?: string;
    createdAt: any;
}

/**
 * Service for User accounts (Auth linked).
 * Bridges legacy Firestore 'users' with V4 Data Connect 'people'.
 */
export const UserService = {
    /**
     * Get all users (merging Firestore auth accounts with Data Connect people)
     */
    async getUsers(): Promise<UserData[]> {
        try {
            // 1. Fetch Auth-linked users from Firestore
            const usersSnap = await getDocs(collection(db, 'users'));
            const authUsers = usersSnap.docs.map(doc => ({
                uid: doc.id,
                personId: doc.id, // Usually 1:1 in legacy
                ...doc.data(),
                hasAccount: true
            } as unknown as UserData));

            // 2. Fetch all People from Data Connect V4
            const people = await personService.getAll();

            // Create a map of email -> User for easy lookup
            const authUserMap = new Map<string, UserData>();
            authUsers.forEach(u => {
                if (u.email) authUserMap.set(u.email.toLowerCase(), u);
            });

            const combined: UserData[] = [...authUsers];

            // 3. Add People who don't have an Auth record yet
            people.forEach(p => {
                const email = p.email;
                const isAuthUser = email && authUserMap.has(email.toLowerCase());

                if (!isAuthUser) {
                    combined.push({
                        // Person fields
                        id: p.id,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        email: p.email || '',
                        status: p.status || 'active',
                        profileImageUrl: p.profileImageUrl || undefined,

                        // Fake Auth fields for UI compatibility
                        uid: `person_${p.id}`,
                        personId: p.id,
                        displayName: p.preferredName || `${p.firstName} ${p.lastName}`,
                        role: 'Player', // Default or derived
                        hasAccount: false,
                        assignedSchools: [],
                        teamIds: []
                    } as UserData);
                }
            });

            return combined;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    /**
     * Get single user
     */
    async getUser(uid: string): Promise<UserData | null> {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return {
                    uid: docSnap.id,
                    personId: docSnap.id,
                    ...docSnap.data()
                } as unknown as UserData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    /**
     * Update user (Both Auth and Person)
     */
    async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
        try {
            // 1. Update Firestore User Document
            if (!uid.startsWith('person_')) {
                const docRef = doc(db, 'users', uid);
                await updateDoc(docRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            }

            // 2. Update Data Connect Person (if applicable)
            const personId = data.personId || (uid.startsWith('person_') ? uid.replace('person_', '') : null);
            if (personId) {
                // Note: We'd need an update mutation in Data Connect for full synergy.
                // For now, we prioritize identity consistency.
                console.log(`Synergy update for person ${personId} requested but not fully implemented in V4 mutation set yet.`);
            }

        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    /**
     * Delete user
     */
    async deleteUser(uid: string): Promise<void> {
        try {
            if (!uid.startsWith('person_')) {
                await deleteDoc(doc(db, 'users', uid));
            } else {
                const personId = uid.replace('person_', '');
                await personService.delete(personId);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    async inviteUser(email: string, role: string, roles?: string[], invitedBy?: string): Promise<string> {
        const invitationsRef = collection(db, 'invitations');
        const newRef = doc(invitationsRef);
        await setDoc(newRef, {
            email,
            role,
            roles: roles || [role],
            status: 'pending',
            invitedBy,
            createdAt: serverTimestamp()
        });
        return newRef.id;
    },

    async getPendingInvitations(): Promise<InvitationData[]> {
        const q = query(collection(db, 'invitations'), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as InvitationData));
    }
};
