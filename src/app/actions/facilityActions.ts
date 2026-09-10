'use server';

import { facilityService, GroundReadinessLog, FacilityBooking } from '@/lib/services/facilityService';
import { recordAuditAction } from './auditActions';
import { revalidatePath } from 'next/cache';

// --- Readiness Actions ---
export async function getLatestReadinessLogAction(fieldId: string) {
    return await facilityService.getLatestReadinessLog(fieldId);
}

export async function logReadinessAction(log: Omit<GroundReadinessLog, 'id'>, fieldName: string) {
    const id = await facilityService.logReadiness(log);

    await recordAuditAction({
        actionType: 'LOGISTICS_UPDATE',
        entityType: 'ground_readiness',
        entityId: id,
        description: `Ground readiness for ${fieldName} updated to ${log.conditionStatus}. (Pitch: ${log.pitchReadiness}%, Outfield: ${log.outfieldReadiness}%)`,
        actorId: 'system-ops',
        actorName: 'Groundskeeper'
    });

    revalidatePath('/fields');
    return id;
}

// --- Booking Actions ---
export async function getFacilityBookingsAction(fieldId: string) {
    return await facilityService.getBookings(fieldId);
}

export async function createFacilityBookingAction(booking: Omit<FacilityBooking, 'id'>, fieldName: string) {
    const id = await facilityService.createBooking(booking);

    await recordAuditAction({
        actionType: 'LOGISTICS_CREATE',
        entityType: 'facility_booking',
        entityId: id,
        description: `New booking for ${fieldName}: ${booking.purpose}.`,
        actorId: 'system-ops',
        actorName: 'Facility Manager'
    });

    revalidatePath('/fields');
    return id;
}
