'use server';

import { medicalService, MedicalIncident } from '@/lib/services/medicalService';
import { recordAuditAction } from './auditActions';
import { revalidatePath } from 'next/cache';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MedicalActionState {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

export async function getMedicalIncidentsAction(personId?: string) {
    return await medicalService.getIncidents(personId);
}

export async function logMedicalIncidentAction(incident: Omit<MedicalIncident, 'id'>) {
    const id = await medicalService.logIncident(incident);

    await recordAuditAction({
        actionType: 'SECURITY_ALERT',
        entityType: 'medical_incident',
        entityId: id,
        description: `New medical incident reported for ${incident.personName || incident.personId}: ${incident.type} (${incident.severity}).`,
        actorId: 'system-ops',
        actorName: 'First Aider / Coordinator'
    });

    revalidatePath('/medical');
    revalidatePath(`/player/${incident.personId}`);
    return id;
}

export async function updateMedicalStatusAction(id: string, status: MedicalIncident['status'], personName: string) {
    await medicalService.updateIncidentStatus(id, status);

    await recordAuditAction({
        actionType: 'LOGISTICS_UPDATE',
        entityType: 'medical_incident',
        entityId: id,
        description: `Medical status for ${personName} updated to ${status}.`,
        actorId: 'system-ops',
        actorName: 'Medical Staff'
    });

    revalidatePath('/medical');
}

/**
 * updateMedicalPersonAction — FormData-based action for MedicalForm on the people edit page.
 * Updates the person's medicalProfile fields in Firestore.
 */
export async function updateMedicalPersonAction(
    id: string,
    prevState: MedicalActionState,
    formData: FormData
): Promise<MedicalActionState> {
    try {
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const qualification = formData.get('qualification') as string;
        const registrationNumber = formData.get('registrationNumber') as string;
        const experienceYears = Number(formData.get('experienceYears') || 0);
        const specializationsRaw = formData.get('specializations') as string;
        const medicalTraitsRaw = formData.get('medicalTraits') as string;

        const specializations = specializationsRaw ? JSON.parse(specializationsRaw) : [];
        const medicalTraits = medicalTraitsRaw ? JSON.parse(medicalTraitsRaw) : [];

        const personRef = doc(db, 'people', id);
        await updateDoc(personRef, {
            firstName,
            lastName,
            'medicalProfile.qualification': qualification,
            'medicalProfile.registrationNumber': registrationNumber,
            'medicalProfile.experienceYears': experienceYears,
            'medicalProfile.specializations': specializations,
            'medicalProfile.medicalTraits': medicalTraits,
        });

        await recordAuditAction({
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'player',
            entityId: id,
            description: `Medical profile updated for ${firstName} ${lastName}.`,
            actorId: 'system-ops',
            actorName: 'Medical Staff'
        });

        revalidatePath(`/people/${id}`);
        revalidatePath(`/people/${id}/edit`);

        return { success: true, message: 'Medical profile updated successfully.' };
    } catch (error) {
        console.error('updateMedicalPersonAction error:', error);
        return { success: false, message: 'Failed to update medical profile. Please try again.' };
    }
}
