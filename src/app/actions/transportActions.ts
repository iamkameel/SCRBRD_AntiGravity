'use server';

import { transportService, TransportTrip, Vehicle } from '@/lib/services/transportService';
import { recordAuditAction } from './auditActions';
import { revalidatePath } from 'next/cache';

// --- Vehicle Actions ---
export async function getVehiclesAction(schoolId?: string): Promise<Vehicle[]> {
    return await transportService.getVehicles(schoolId);
}

export async function updateVehicleStatusAction(id: string, status: Vehicle['status'], load?: number) {
    await transportService.updateVehicleStatus(id, status, load);

    await recordAuditAction({
        actionType: 'LOGISTICS_UPDATE',
        entityType: 'vehicle',
        entityId: id,
        description: `Vehicle status updated to ${status}${load !== undefined ? ` with ${load}% load` : ''}.`,
        actorId: 'system-ops', // In a real app, get from session
        actorName: 'Logistics Coordinator'
    });

    revalidatePath('/transport');
}

// --- Trip Actions ---
export async function getUpcomingTripsAction(schoolId?: string): Promise<TransportTrip[]> {
    return await transportService.getUpcomingTrips(schoolId);
}

export async function createTripAction(trip: Omit<TransportTrip, 'id'>) {
    const id = await transportService.createTrip(trip);

    await recordAuditAction({
        actionType: 'LOGISTICS_CREATE',
        entityType: 'transport_trip',
        entityId: id,
        description: `New transport trip created for ${trip.fixture || trip.fixtureId} to ${trip.destination}.`,
        actorId: 'system-ops',
        actorName: 'Logistics Coordinator'
    });

    revalidatePath('/transport');
    return id;
}

export async function updateTripStatusAction(id: string, status: TransportTrip['status'], fixtureName: string) {
    await transportService.updateTripStatus(id, status);

    await recordAuditAction({
        actionType: 'LOGISTICS_UPDATE',
        entityType: 'transport_trip',
        entityId: id,
        description: `Trip status for ${fixtureName} updated to ${status}.`,
        actorId: 'system-ops',
        actorName: 'Logistics Coordinator'
    });

    revalidatePath('/transport');
}

export async function getDriverTripsAction(driverId: string): Promise<TransportTrip[]> {
    return await transportService.getDriverTrips(driverId);
}
