'use server';

import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { scorerSchema } from '@/lib/validations/scorerSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface ScorerActionState {
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

function extractScorerData(formData: FormData) {
    const technicalAttributes = {
        softwareProficiency: getNum(formData.get('technicalAttributes.softwareProficiency')),
        lawKnowledge: getNum(formData.get('technicalAttributes.lawKnowledge')),
        linearScoring: getNum(formData.get('technicalAttributes.linearScoring')),
        digitalScoring: getNum(formData.get('technicalAttributes.digitalScoring')),
        problemSolving: getNum(formData.get('technicalAttributes.problemSolving')),
    };

    const professionalAttributes = {
        concentration: getNum(formData.get('professionalAttributes.concentration')),
        speed: getNum(formData.get('professionalAttributes.speed')),
        accuracy: getNum(formData.get('professionalAttributes.accuracy')),
        communication: getNum(formData.get('professionalAttributes.communication')),
        punctuality: getNum(formData.get('professionalAttributes.punctuality')),
        collaboration: getNum(formData.get('professionalAttributes.collaboration')),
    };

    return {
        firstName: (formData.get('firstName') as string) ?? '',
        lastName: (formData.get('lastName') as string) ?? '',
        dateOfBirth: (formData.get('dateOfBirth') as string) ?? '',
        email: (formData.get('email') as string) ?? '',
        phoneNumber: (formData.get('phoneNumber') as string) ?? '',

        certificationLevel: formData.get('certificationLevel') || 'Level 1',
        preferredMethod: formData.get('preferredMethod') || 'Digital',
        experienceYears: getNum(formData.get('experienceYears')) ?? 0,

        technicalAttributes,
        professionalAttributes,

        scorerTraits: formData.get('scorerTraits') ? JSON.parse(formData.get('scorerTraits') as string) : [],
    };
}

function mapToFirestoreScorer(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        technicalAttributes,
        professionalAttributes,
        certificationLevel,
        preferredMethod,
        experienceYears,
        scorerTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: USER_ROLES.SCORER,
        scorerProfile: {
            certificationLevel,
            preferredMethod,
            experienceYears,
            technicalAttributes,
            professionalAttributes,
            scorerTraits,
        }
    };
}

export async function createScorerAction(prevState: ScorerActionState, formData: FormData): Promise<ScorerActionState> {
    const user = await requireUser('management');

    const rawData = extractScorerData(formData);
    const validatedFields = scorerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    let createdId = '';
    try {
        const scorerData = mapToFirestoreScorer(validatedFields.data);

        const docRef = await adminDb.collection('people').add({
            ...scorerData,
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        createdId = docRef.id;

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Management Staff',
            actionType: 'STAFF_ASSIGNED',
            entityType: 'scorer',
            entityId: createdId,
            description: `Scorer profile created for ${validatedFields.data.firstName} ${validatedFields.data.lastName}.`,
        });

    } catch (error) {
        console.error('Error creating scorer:', error);
        return {
            message: 'Database Error: Failed to create scorer.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateScorerAction(
    id: string,
    prevState: ScorerActionState,
    formData: FormData
): Promise<ScorerActionState> {
    const user = await requireUser('management');

    const rawData = extractScorerData(formData);
    const validatedFields = scorerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const scorerData = mapToFirestoreScorer(validatedFields.data);

        await adminDb.collection('people').doc(id).update({
            ...scorerData,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Management Staff',
            actionType: 'STAFF_ASSIGNED',
            entityType: 'scorer',
            entityId: id,
            description: `Scorer profile updated for ${validatedFields.data.firstName} ${validatedFields.data.lastName}.`,
        });

    } catch (error) {
        console.error('Error updating scorer:', error);
        return {
            message: 'Database Error: Failed to update scorer.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
