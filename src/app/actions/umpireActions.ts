'use server';

import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { umpireSchema } from '@/lib/validations/umpireSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface UmpireActionState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
}

function getNum(val: FormDataEntryValue | null): number | undefined {
    if (!val || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}

function extractUmpireData(formData: FormData) {
    const preferredFormats = formData.getAll('preferredFormats') as string[];

    const decisionAttributes = {
        lbwJudgement: getNum(formData.get('decisionAttributes.lbwJudgement')),
        caughtBehindAccuracy: getNum(formData.get('decisionAttributes.caughtBehindAccuracy')),
        runOutPositioning: getNum(formData.get('decisionAttributes.runOutPositioning')),
        boundaryCalls: getNum(formData.get('decisionAttributes.boundaryCalls')),
        drsAccuracy: getNum(formData.get('decisionAttributes.drsAccuracy')),
        consistency: getNum(formData.get('decisionAttributes.consistency')),
    };

    const matchControlAttributes = {
        playerManagement: getNum(formData.get('matchControlAttributes.playerManagement')),
        conflictResolution: getNum(formData.get('matchControlAttributes.conflictResolution')),
        timeManagement: getNum(formData.get('matchControlAttributes.timeManagement')),
        lawApplication: getNum(formData.get('matchControlAttributes.lawApplication')),
        communication: getNum(formData.get('matchControlAttributes.communication')),
        pressureHandling: getNum(formData.get('matchControlAttributes.pressureHandling')),
    };

    const physicalAttributes = {
        fitness: getNum(formData.get('physicalAttributes.fitness')),
        endurance: getNum(formData.get('physicalAttributes.endurance')),
        positioningAgility: getNum(formData.get('physicalAttributes.positioningAgility')),
        concentration: getNum(formData.get('physicalAttributes.concentration')),
        vision: getNum(formData.get('physicalAttributes.vision')),
    };

    return {
        firstName: (formData.get('firstName') as string) ?? '',
        lastName: (formData.get('lastName') as string) ?? '',
        dateOfBirth: (formData.get('dateOfBirth') as string) ?? '',
        email: (formData.get('email') as string) ?? '',
        phoneNumber: (formData.get('phoneNumber') as string) ?? '',

        certificationLevel: formData.get('certificationLevel') || 'Level 1',
        homeAssociation: formData.get('homeAssociation') || '',
        yearsActive: getNum(formData.get('yearsActive')) ?? 0,
        preferredFormats,

        decisionAttributes,
        matchControlAttributes,
        physicalAttributes,

        umpireTraits: formData.get('umpireTraits') ? JSON.parse(formData.get('umpireTraits') as string) : [],
    };
}

function mapToFirestoreUmpire(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        decisionAttributes,
        matchControlAttributes,
        physicalAttributes,
        certificationLevel,
        homeAssociation,
        yearsActive,
        preferredFormats,
        umpireTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: USER_ROLES.UMPIRE,
        umpireProfile: {
            certificationLevel,
            homeAssociation,
            yearsActive,
            preferredFormats,
            decisionAttributes,
            matchControlAttributes,
            physicalAttributes,
            umpireTraits,
        }
    };
}

export async function createUmpireAction(prevState: UmpireActionState, formData: FormData): Promise<UmpireActionState> {
    const user = await requireUser('management');

    const rawData = extractUmpireData(formData);
    const validatedFields = umpireSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    let createdId = '';
    try {
        const umpireData = mapToFirestoreUmpire(validatedFields.data);

        const docRef = await adminDb.collection('people').add({
            ...umpireData,
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        createdId = docRef.id;

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Management Staff',
            actionType: 'STAFF_ASSIGNED',
            entityType: 'umpire',
            entityId: createdId,
            description: `Umpire profile created for ${validatedFields.data.firstName} ${validatedFields.data.lastName}.`,
        });

    } catch (error) {
        console.error('Error creating umpire:', error);
        return {
            message: 'Database Error: Failed to create umpire.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateUmpireAction(
    id: string,
    prevState: UmpireActionState,
    formData: FormData
): Promise<UmpireActionState> {
    const user = await requireUser('management');

    const rawData = extractUmpireData(formData);
    const validatedFields = umpireSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const umpireData = mapToFirestoreUmpire(validatedFields.data);

        await adminDb.collection('people').doc(id).update({
            ...umpireData,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Management Staff',
            actionType: 'STAFF_ASSIGNED',
            entityType: 'umpire',
            entityId: id,
            description: `Umpire profile updated for ${validatedFields.data.firstName} ${validatedFields.data.lastName}.`,
        });

    } catch (error) {
        console.error('Error updating umpire:', error);
        return {
            message: 'Database Error: Failed to update umpire.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
