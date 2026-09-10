'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setDocument, deleteDocument, fetchPersonById } from '@/lib/firestore';
import { Person } from '@/types/firestore';
import { hasHigherOrEqualRole, USER_ROLES, UserRole } from '@/lib/roles';
import { serializeData } from '@/lib/serialize';

/**
 * Check if user has permission to perform action
 * This is a placeholder - in production, get from auth context
 */
async function checkPermission(requiredRole: UserRole): Promise<boolean> {
    // TODO: Get current user role from auth context
    // For now, allow all operations
    return true;
}

export async function createPersonAction(formData: FormData) {
    try {
        // Check permissions
        const hasPermission = await checkPermission(USER_ROLES.COACH);
        if (!hasPermission) {
            return {
                success: false as const,
                error: 'You do not have permission to create people'
            };
        }

        const personData: Partial<Person> = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || undefined,
            role: formData.get('role') as string,
            title: formData.get('title') as string || undefined,
            schoolId: formData.get('schoolId') as string || undefined,
            teamIds: formData.get('teamIds') ? JSON.parse(formData.get('teamIds') as string) : [],
            specializations: formData.get('specializations') ? JSON.parse(formData.get('specializations') as string) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Generate ID
        const personId = `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        personData.id = personId;

        await setDocument('people', personId, personData);

        revalidatePath('/people');
        return serializeData({ success: true as const, id: personId });
    } catch (error) {
        console.error('Error creating person:', error);
        return {
            success: false as const,
            error: error instanceof Error ? error.message : 'Failed to create person'
        };
    }
}

export async function updatePersonAction(personId: string, formData: FormData) {
    try {
        // Check permissions
        const hasPermission = await checkPermission(USER_ROLES.COACH);
        if (!hasPermission) {
            return {
                success: false as const,
                error: 'You do not have permission to update people'
            };
        }

        const existingPerson = await fetchPersonById(personId);
        if (!existingPerson) {
            return { success: false as const, error: 'Person not found' };
        }

        const personData: any = {
            ...existingPerson,
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || undefined,
            role: formData.get('role') as string,
            title: formData.get('title') as string || undefined,
            schoolId: formData.get('schoolId') as string || undefined,
            teamIds: formData.get('teamIds') ? JSON.parse(formData.get('teamIds') as string) : [],
            specializations: formData.get('specializations') ? JSON.parse(formData.get('specializations') as string) : [],
            updatedAt: new Date().toISOString(),
        };

        await setDocument('people', personId, personData);

        revalidatePath('/people');
        revalidatePath(`/people/${personId}`);
        return serializeData({ success: true as const });
    } catch (error) {
        console.error('Error updating person:', error);
        return {
            success: false as const,
            error: error instanceof Error ? error.message : 'Failed to update person'
        };
    }
}

export async function deletePersonAction(personId: string) {
    try {
        // Check permissions - only admins can delete
        const hasPermission = await checkPermission(USER_ROLES.ADMIN);
        if (!hasPermission) {
            return {
                success: false,
                error: 'You do not have permission to delete people'
            };
        }

        await deleteDocument('people', personId);

        revalidatePath('/people');
        return { success: true };
    } catch (error) {
        console.error('Error deleting person:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete person'
        };
    }
}

export async function bulkDeletePeopleAction(personIds: string[]) {
    try {
        // Check permissions - only admins can bulk delete
        const hasPermission = await checkPermission(USER_ROLES.ADMIN);
        if (!hasPermission) {
            return {
                success: false,
                error: 'You do not have permission to delete people'
            };
        }

        await Promise.all(
            personIds.map(id => deleteDocument('people', id))
        );

        revalidatePath('/people');
        return { success: true, count: personIds.length };
    } catch (error) {
        console.error('Error bulk deleting people:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete people'
        };
    }
}

export async function fetchPersonByEmail(email: string) {
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const snapshot = await admin.firestore().collection('people').where('email', '==', email).limit(1).get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return serializeData({ id: doc.id, ...doc.data() }) as Person;
    } catch (error) {
        console.error('Error fetching person by email:', error);
        return null;
    }
}

export async function fetchInjuredPlayers() {
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const snapshot = await admin.firestore().collection('people')
            .where('status', '==', 'injured')
            .get();

        return serializeData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))) as Person[];
    } catch (error) {
        console.error('Error fetching injured players:', error);
        return [];
    }
}


