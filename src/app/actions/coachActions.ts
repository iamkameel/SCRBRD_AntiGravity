'use server';

import { coachSchema } from '@/lib/validations/coachSchema';
import { Person } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';

export type CoachActionState = {
    error?: string;
    fieldErrors?: Record<string, string[]>;
    success?: boolean;
};

function extractCoachData(formData: FormData) {
    const extractGroup = (prefix: string, keys: string[]) => {
        const obj: any = {};
        let hasData = false;
        keys.forEach(key => {
            const val = formData.get(`${prefix}.${key}`);
            if (val) {
                obj[key] = Number(val);
                hasData = true;
            }
        });
        return hasData ? obj : undefined;
    };

    const extractArray = (prefix: string) => {
        const items: string[] = [];
        let i = 0;
        while (true) {
            const val = formData.get(`${prefix}[${i}]`);
            if (!val) break;
            items.push(val as string);
            i++;
        }
        return items.length > 0 ? items : undefined;
    };

    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email') || '',
        phoneNumber: formData.get('phoneNumber') || '',
        dateOfBirth: formData.get('dateOfBirth'),
        schoolId: formData.get('schoolId'),
        assignedSchools: extractArray('assignedSchools'),
        teamIds: extractArray('teamIds'),
        status: formData.get('status') || 'active',
        role: formData.get('role') || 'Coach',

        // Coach Profile Core
        currentRole: formData.get('currentRole') || '',
        qualificationLevel: formData.get('qualificationLevel') || '',
        coachingSince: formData.get('coachingSince') ? Number(formData.get('coachingSince')) : undefined,
        philosophySummary: formData.get('philosophySummary') || undefined,
        currentAbility: formData.get('currentAbility') ? Number(formData.get('currentAbility')) : 10,
        potentialAbility: formData.get('potentialAbility') ? Number(formData.get('potentialAbility')) : 10,
        reputation: formData.get('reputation') ? Number(formData.get('reputation')) : 1,

        // Arrays (JSON strings)
        primaryTeams: formData.get('primaryTeams') ? JSON.parse(formData.get('primaryTeams') as string) : [],
        preferredFormats: formData.get('preferredFormats') ? JSON.parse(formData.get('preferredFormats') as string) : [],
        coachTraits: formData.get('coachTraits') ? JSON.parse(formData.get('coachTraits') as string) : [],
        coachSeasonStats: formData.get('coachSeasonStats') ? JSON.parse(formData.get('coachSeasonStats') as string) : undefined,

        // Attribute Groups
        coachingAttributes: extractGroup('coachingAttributes', [
            'battingCoaching', 'fastBowlingCoaching', 'spinBowlingCoaching', 'fieldingCoaching',
            'wicketkeepingCoaching', 'youthDevelopment', 'seniorDevelopment', 'oneToOneCoaching',
            'sessionPlanning', 'videoAnalysisUse'
        ]),
        tacticalAttributes: extractGroup('tacticalAttributes', [
            'tacticsLimitedOvers', 'tacticsLongFormat', 'fieldSetting', 'bowlingChanges',
            'battingOrderConstruction', 'inGameAdaptability', 'analyticsUse', 'oppositionAnalysis'
        ]),
        manManagementAttributes: extractGroup('manManagementAttributes', [
            'playerCommunication', 'parentCommunication', 'motivation', 'conflictManagement',
            'disciplineStandards', 'leadershipPresence', 'playerWelfare', 'feedbackQuality'
        ]),
        professionalAttributes: extractGroup('professionalAttributes', [
            'organisation', 'attentionToDetail', 'opennessToNewMethods', 'consistency',
            'workEthic', 'pressureComposure', 'longTermPlanning'
        ]),
    };
}

function mapToFirestoreCoach(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        coachingAttributes,
        tacticalAttributes,
        manManagementAttributes,
        professionalAttributes,
        currentRole,
        qualificationLevel,
        coachingSince,
        primaryTeams,
        preferredFormats,
        philosophySummary,
        currentAbility,
        potentialAbility,
        reputation,
        coachTraits,
        coachSeasonStats,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: validatedData.role,
        coachProfile: {
            currentRole,
            qualificationLevel,
            coachingSince,
            primaryTeams,
            preferredFormats,
            philosophySummary,
            currentAbility,
            potentialAbility,
            reputation,
            coachingAttributes,
            tacticalAttributes,
            manManagementAttributes,
            professionalAttributes,
            coachTraits,
            coachSeasonStats,
        }
    };
}

export async function createCoachAction(
    prevState: CoachActionState,
    formData: FormData
): Promise<CoachActionState> {
    try {
        const user = await requireUser('management');
        const rawData = extractCoachData(formData);
        const validatedData = coachSchema.parse(rawData);
        const newCoachData = mapToFirestoreCoach(validatedData);

        const docRef = await adminDb.collection('people').add({
            ...newCoachData,
            createdBy: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Management Staff',
            actionType: 'STAFF_ASSIGNED',
            entityType: 'coach',
            entityId: docRef.id,
            description: `Assigned new coach profile: ${validatedData.firstName} ${validatedData.lastName} (${validatedData.role})`,
        });

        revalidatePath('/people');
    } catch (error) {
        if (error instanceof ZodError) {
            const fieldErrors: Record<string, string[]> = {};
            error.issues.forEach((err) => {
                const field = String(err.path[0]);
                if (!fieldErrors[field]) fieldErrors[field] = [];
                fieldErrors[field].push(err.message);
            });
            return { fieldErrors };
        }
        console.error('Create coach error:', error);
        return { error: (error as Error).message || 'Failed to create coach' };
    }
    redirect('/people');
}

export async function updateCoachAction(
    id: string,
    prevState: CoachActionState,
    formData: FormData
): Promise<CoachActionState> {
    try {
        const user = await requireUser('management');
        const rawData = extractCoachData(formData);
        const validatedData = coachSchema.parse(rawData);
        const updateData = mapToFirestoreCoach(validatedData);

        await adminDb.collection('people').doc(id).update({
            ...updateData,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Management Staff',
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'coach',
            entityId: id,
            description: `Updated coach profile attributes: ${validatedData.firstName} ${validatedData.lastName}`,
        });

        revalidatePath('/people');
        revalidatePath(`/people/${id}`);
    } catch (error) {
        if (error instanceof ZodError) {
            const fieldErrors: Record<string, string[]> = {};
            error.issues.forEach((err) => {
                const field = String(err.path[0]);
                if (!fieldErrors[field]) fieldErrors[field] = [];
                fieldErrors[field].push(err.message);
            });
            return { fieldErrors };
        }
        console.error('Update coach error:', error);
        return { error: (error as Error).message || 'Failed to update coach' };
    }
    redirect(`/people/${id}`);
}
