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
        const db = admin.firestore();
        const snapshot = await db.collection('people').where('email', '==', email).limit(1).get();

        const { resolveSchoolByEmail } = await import('@/lib/services/schoolDomainService');
        const resolvedDomainSchool = await resolveSchoolByEmail(email);

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data() as Person;

            // If person lacks schoolId but domain mapping found a match, auto-assign
            if (!data.schoolId && resolvedDomainSchool) {
                await db.collection('people').doc(doc.id).update({
                    schoolId: resolvedDomainSchool.schoolId,
                    updatedAt: new Date().toISOString(),
                });
                data.schoolId = resolvedDomainSchool.schoolId;
            }

            return serializeData({ ...data, id: doc.id }) as Person;
        }

        // If no person document exists yet but domain auto-mapping matched a school,
        // provision an initial Person record for this email automatically.
        if (resolvedDomainSchool) {
            const personId = `person_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const nameParts = email.split('@')[0].split('.');
            const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Staff';
            const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Member';

            const newPerson: Partial<Person> = {
                id: personId,
                email: email,
                firstName: firstName,
                lastName: lastName,
                role: 'Sportsmaster',
                schoolId: resolvedDomainSchool.schoolId,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.collection('people').doc(personId).set(newPerson);
            revalidatePath('/people');
            return serializeData(newPerson) as Person;
        }

        return null;
    } catch (error) {
        console.error('Error fetching person by email:', error);
        return null;
    }
}

export async function resolveSchoolByEmailAction(email: string) {
    try {
        const { resolveSchoolByEmail } = await import('@/lib/services/schoolDomainService');
        const result = await resolveSchoolByEmail(email);
        return serializeData({ success: true, school: result });
    } catch (error) {
        console.error('Error resolving school by email:', error);
        return { success: false, school: null };
    }
}

export async function completeOnboardingAction(data: {
    email: string;
    schoolName: string;
    schoolRegion?: string;
    role: string;
    teamName: string;
    ageGroup: string;
}) {
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const db = admin.firestore();

        // 1. Ensure or create School
        let schoolId = `school_${data.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const schoolDoc = await db.collection('schools').doc(schoolId).get();

        if (!schoolDoc.exists) {
            await db.collection('schools').doc(schoolId).set({
                id: schoolId,
                name: data.schoolName,
                location: data.schoolRegion || 'South Africa',
                contactEmail: data.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        // 2. Ensure or create Team
        const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await db.collection('teams').doc(teamId).set({
            id: teamId,
            name: data.teamName,
            schoolId: schoolId,
            suffix: data.ageGroup,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // 3. Upsert Person with role and schoolId
        const snapshot = await db.collection('people').where('email', '==', data.email).limit(1).get();
        let personId = `person_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        if (!snapshot.empty) {
            personId = snapshot.docs[0].id;
            await db.collection('people').doc(personId).update({
                schoolId: schoolId,
                role: data.role,
                teamIds: admin.firestore.FieldValue.arrayUnion(teamId),
                updatedAt: new Date().toISOString(),
            });
        } else {
            const nameParts = data.email.split('@')[0].split('.');
            const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Staff';
            const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Member';

            await db.collection('people').doc(personId).set({
                id: personId,
                email: data.email,
                firstName,
                lastName,
                role: data.role,
                schoolId: schoolId,
                teamIds: [teamId],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        revalidatePath('/people');
        revalidatePath('/schools');
        revalidatePath('/dashboard');
        revalidatePath('/onboarding');

        return serializeData({
            success: true,
            schoolId,
            personId,
            teamId,
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to complete onboarding',
        };
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

export async function fetchPlayersAction() {
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const snapshot = await admin.firestore().collection('people')
            .limit(50)
            .get();

        if (snapshot.empty) {
            return serializeData([
                { id: 'player-1', firstName: 'Kameel', lastName: 'Kalyan', playingRole: 'Opener', role: 'Player' },
                { id: 'player-2', firstName: 'Liam', lastName: 'Botha', playingRole: 'New-ball Seamer', role: 'Player' },
                { id: 'player-3', firstName: 'Thabo', lastName: 'Mokoena', playingRole: 'Wicketkeeper-Batter', role: 'Player' },
                { id: 'player-4', firstName: 'Ethan', lastName: 'van Zyl', playingRole: 'Wrist Spinner', role: 'Player' },
            ]);
        }

        const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return serializeData(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        return serializeData([
            { id: 'player-1', firstName: 'Kameel', lastName: 'Kalyan', playingRole: 'Opener', role: 'Player' },
            { id: 'player-2', firstName: 'Liam', lastName: 'Botha', playingRole: 'New-ball Seamer', role: 'Player' },
            { id: 'player-3', firstName: 'Thabo', lastName: 'Mokoena', playingRole: 'Wicketkeeper-Batter', role: 'Player' },
            { id: 'player-4', firstName: 'Ethan', lastName: 'van Zyl', playingRole: 'Wrist Spinner', role: 'Player' },
        ]);
    }
}



