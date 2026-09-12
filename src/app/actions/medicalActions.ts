'use server';

import { medicalService, MedicalIncident } from '@/lib/services/medicalService';
import { recordAuditLog } from '@/lib/services/auditService';
import { requireUser } from '@/lib/auth/session';
import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export interface MedicalActionState {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

export async function getMedicalIncidentsAction(personId?: string) {
    return await medicalService.getIncidents(personId);
}

export async function logMedicalIncidentAction(incident: Omit<MedicalIncident, 'id'>) {
    const user = await requireUser('medical');
    const id = await medicalService.logIncident(incident);

    await recordAuditLog({
        actorId: user.uid,
        actorName: user.email || 'Medical Staff',
        actionType: 'SECURITY_ALERT',
        entityType: 'medical_incident',
        entityId: id,
        description: `New medical incident reported for ${incident.personName || incident.personId}: ${incident.type} (${incident.severity}).`,
    });

    revalidatePath('/medical');
    revalidatePath(`/player/${incident.personId}`);
    return id;
}

export async function updateMedicalStatusAction(id: string, status: MedicalIncident['status'], personName: string) {
    const user = await requireUser('medical');
    await medicalService.updateIncidentStatus(id, status);

    await recordAuditLog({
        actorId: user.uid,
        actorName: user.email || 'Medical Staff',
        actionType: 'LOGISTICS_UPDATE',
        entityType: 'medical_incident',
        entityId: id,
        description: `Medical status for ${personName} updated to ${status}.`,
    });

    revalidatePath('/medical');
}

/**
 * updateMedicalPersonAction — FormData-based action for MedicalForm on the people edit page.
 * Updates the person's medicalProfile fields in Firestore via adminDb.
 */
export async function updateMedicalPersonAction(
    id: string,
    prevState: MedicalActionState,
    formData: FormData
): Promise<MedicalActionState> {
    try {
        const user = await requireUser('medical');

        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const qualification = formData.get('qualification') as string;
        const registrationNumber = formData.get('registrationNumber') as string;
        const experienceYears = Number(formData.get('experienceYears') || 0);
        const specializationsRaw = formData.get('specializations') as string;
        const medicalTraitsRaw = formData.get('medicalTraits') as string;

        const specializations = specializationsRaw ? JSON.parse(specializationsRaw) : [];
        const medicalTraits = medicalTraitsRaw ? JSON.parse(medicalTraitsRaw) : [];

        await adminDb.collection('people').doc(id).update({
            firstName,
            lastName,
            'medicalProfile.qualification': qualification,
            'medicalProfile.registrationNumber': registrationNumber,
            'medicalProfile.experienceYears': experienceYears,
            'medicalProfile.specializations': specializations,
            'medicalProfile.medicalTraits': medicalTraits,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Medical Staff',
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'player',
            entityId: id,
            description: `Medical profile updated for ${firstName} ${lastName}.`,
        });

        revalidatePath(`/people/${id}`);
        revalidatePath(`/people/${id}/edit`);

        return { success: true, message: 'Medical profile updated successfully.' };
    } catch (error) {
        console.error('updateMedicalPersonAction error:', error);
        return { success: false, message: 'Failed to update medical profile. Please try again.' };
    }
}
