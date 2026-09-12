'use server';

import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';
import { revalidatePath } from 'next/cache';
import { TransportTrip, Vehicle } from '@/lib/services/transportService';

// --- Vehicle Actions ---
export async function getVehiclesAction(schoolId?: string): Promise<{ success: boolean; data: Vehicle[] }> {
    try {
        let queryRef: FirebaseFirestore.Query = adminDb.collection('vehicles');
        if (schoolId) {
            queryRef = queryRef.where('schoolId', '==', schoolId);
        }
        queryRef = queryRef.orderBy('makeModel');

        const snapshot = await queryRef.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        return { success: false, data: [] };
    }
}

export async function updateVehicleStatusAction(id: string, status: Vehicle['status'], load?: number) {
    try {
        const user = await requireUser("logistics");
        const nowIso = new Date().toISOString();

        await adminDb.collection('vehicles').doc(id).update({
            status,
            ...(load !== undefined && { currentLoad: load }),
            updatedBy: user.uid,
            updatedAt: nowIso,
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Logistics Coordinator',
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'vehicle',
            entityId: id,
            description: `Vehicle status updated to ${status}${load !== undefined ? ` with ${load}% load` : ''}.`,
        });

        revalidatePath('/transport');
        return { success: true };
    } catch (error) {
        console.error("Error updating vehicle status:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update vehicle status." };
    }
}

// --- Trip Actions ---
export async function getUpcomingTripsAction(schoolId?: string): Promise<{ success: boolean; data: TransportTrip[] }> {
    try {
        const snapshot = await adminDb.collection('transport_trips').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch upcoming trips:", error);
        return { success: false, data: [] };
    }
}

export async function createTripAction(trip: Omit<TransportTrip, 'id'>) {
    try {
        const user = await requireUser("logistics");
        const nowIso = new Date().toISOString();

        const docRef = await adminDb.collection('transport_trips').add({
            ...trip,
            createdBy: user.uid,
            createdAt: nowIso,
            updatedAt: nowIso,
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Logistics Coordinator',
            actionType: 'LOGISTICS_CREATE',
            entityType: 'transport_trip',
            entityId: docRef.id,
            description: `New transport trip created for ${trip.fixture || trip.fixtureId || 'Match'} to ${trip.destination}.`,
        });

        revalidatePath('/transport');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating transport trip:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create transport trip." };
    }
}

export async function updateTripStatusAction(id: string, status: TransportTrip['status'], fixtureName: string) {
    try {
        const user = await requireUser("logistics");
        const nowIso = new Date().toISOString();

        await adminDb.collection('transport_trips').doc(id).update({
            status,
            updatedBy: user.uid,
            updatedAt: nowIso,
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Logistics Coordinator',
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'transport_trip',
            entityId: id,
            description: `Trip status for ${fixtureName} updated to ${status}.`,
        });

        revalidatePath('/transport');
        return { success: true };
    } catch (error) {
        console.error("Error updating trip status:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update trip status." };
    }
}

export async function updatePassengerBoardingAction(passengerId: string, boardingStatus: string, tripId: string) {
    try {
        const user = await requireUser("logistics");
        const nowIso = new Date().toISOString();

        await adminDb.collection('trip_passengers').doc(passengerId).update({
            boardingStatus,
            updatedBy: user.uid,
            updatedAt: nowIso,
        });

        await recordAuditLog({
            actorId: user.uid,
            actorName: user.email || 'Logistics Coordinator',
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'transport_trip',
            entityId: tripId,
            description: `Passenger boarding status updated to ${boardingStatus}.`,
        });

        revalidatePath('/transport');
        return { success: true };
    } catch (error) {
        console.error("Error updating passenger status:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update passenger status." };
    }
}

export async function getDriverTripsAction(driverId: string): Promise<{ success: boolean; data: TransportTrip[] }> {
    try {
        const snapshot = await adminDb
            .collection('transport_trips')
            .where('driverId', '==', driverId)
            .get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch driver trips:", error);
        return { success: false, data: [] };
    }
}
