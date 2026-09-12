'use server';

import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { groundskeeperSchema } from '@/lib/validations/groundskeeperSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface GroundskeeperActionState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
}

function getOptionalNum(val: FormDataEntryValue | null): number | undefined {
    if (val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
}

function extractGroundskeeperData(formData: FormData) {
    const pitchAttrsRaw = {
        paceGeneration: getOptionalNum(formData.get('pitchAttributes.paceGeneration')),
        spinPromotion: getOptionalNum(formData.get('pitchAttributes.spinPromotion')),
        durability: getOptionalNum(formData.get('pitchAttributes.durability')),
        evenness: getOptionalNum(formData.get('pitchAttributes.evenness')),
        moistureControl: getOptionalNum(formData.get('pitchAttributes.moistureControl')),
    };

    const outfieldAttrsRaw = {
        drainageManagement: getOptionalNum(formData.get('outfieldAttributes.drainageManagement')),
        grassHealth: getOptionalNum(formData.get('outfieldAttributes.grassHealth')),
        boundaryMarking: getOptionalNum(formData.get('outfieldAttributes.boundaryMarking')),
        rollering: getOptionalNum(formData.get('outfieldAttributes.rollering')),
        mowing: getOptionalNum(formData.get('outfieldAttributes.mowing')),
    };

    // Filter out keys where value is undefined so Zod defaults take over
    const pitchAttributes = Object.fromEntries(
        Object.entries(pitchAttrsRaw).filter(([_, v]) => v !== undefined)
    );
    const outfieldAttributes = Object.fromEntries(
        Object.entries(outfieldAttrsRaw).filter(([_, v]) => v !== undefined)
    );

    return {
        firstName: (formData.get('firstName') as string) ?? '',
        lastName: (formData.get('lastName') as string) ?? '',
        dateOfBirth: (formData.get('dateOfBirth') as string) ?? '',
        email: (formData.get('email') as string) ?? '',
        phoneNumber: (formData.get('phoneNumber') as string) ?? '',

        experienceYears: getOptionalNum(formData.get('experienceYears')) ?? 0,

        pitchAttributes: Object.keys(pitchAttributes).length > 0 ? pitchAttributes : undefined,
        outfieldAttributes: Object.keys(outfieldAttributes).length > 0 ? outfieldAttributes : undefined,

        machineryLicenses: formData.get('machineryLicenses') ? JSON.parse(formData.get('machineryLicenses') as string) : [],
        primaryVenues: formData.get('primaryVenues') ? JSON.parse(formData.get('primaryVenues') as string) : [],
        groundskeeperTraits: formData.get('groundskeeperTraits') ? JSON.parse(formData.get('groundskeeperTraits') as string) : [],
    };
}

function mapToFirestoreGroundskeeper(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        pitchAttributes,
        outfieldAttributes,
        experienceYears,
        machineryLicenses,
        primaryVenues,
        groundskeeperTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: USER_ROLES.GROUNDS_KEEPER,
        groundskeeperProfile: {
            experienceYears,
            machineryLicenses,
            primaryVenues,
            pitchAttributes,
            outfieldAttributes,
            groundskeeperTraits,
        }
    };
}

export async function createGroundskeeperAction(prevState: GroundskeeperActionState, formData: FormData): Promise<GroundskeeperActionState> {
    const user = await requireUser("logistics");

    const rawData = extractGroundskeeperData(formData);
    const validatedFields = groundskeeperSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    let docId = '';
    try {
        const groundskeeperData = mapToFirestoreGroundskeeper(validatedFields.data);

        const docRef = await adminDb.collection('people').add({
            ...groundskeeperData,
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        docId = docRef.id;

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Logistics Admin',
            actionType: 'LOGISTICS_CREATE',
            entityType: 'groundskeeper',
            entityId: docId,
            description: `Groundskeeper profile created for ${validatedFields.data.firstName} ${validatedFields.data.lastName}.`,
        });

    } catch (error) {
        console.error('Error creating groundskeeper:', error);
        return {
            message: 'Database Error: Failed to create groundskeeper.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateGroundskeeperAction(
    id: string,
    prevState: GroundskeeperActionState,
    formData: FormData
): Promise<GroundskeeperActionState> {
    const user = await requireUser("logistics");

    const rawData = extractGroundskeeperData(formData);
    const validatedFields = groundskeeperSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const groundskeeperData = mapToFirestoreGroundskeeper(validatedFields.data);

        await adminDb.collection('people').doc(id).update({
            ...groundskeeperData,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Logistics Admin',
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'groundskeeper',
            entityId: id,
            description: `Groundskeeper profile updated for ${validatedFields.data.firstName} ${validatedFields.data.lastName}.`,
        });

    } catch (error) {
        console.error('Error updating groundskeeper:', error);
        return {
            message: 'Database Error: Failed to update groundskeeper.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
