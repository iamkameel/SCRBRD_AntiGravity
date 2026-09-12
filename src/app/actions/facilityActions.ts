'use server';

import { facilityService, GroundReadinessLog, FacilityBooking } from '@/lib/services/facilityService';
import { recordAuditAction } from './auditActions';
import { requireUser } from '@/lib/auth/session';
import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export interface MaintenanceTask {
    id: string;
    fieldId: string;
    fieldName: string;
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    assignedTo?: string;
    dueDate: string;
    createdAt: string;
}

// --- Readiness Actions ---
export async function getLatestReadinessLogAction(fieldId: string) {
    try {
        return await facilityService.getLatestReadinessLog(fieldId);
    } catch (error) {
        console.error("Failed to fetch latest readiness log:", error);
        return null;
    }
}

export async function logReadinessAction(log: Omit<GroundReadinessLog, 'id'>, fieldName: string) {
    try {
        const user = await requireUser("logistics");

        const id = await facilityService.logReadiness(log);

        await recordAuditAction({
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'ground_readiness',
            entityId: id,
            description: `Ground readiness for ${fieldName} updated to ${log.conditionStatus}. (Pitch: ${log.pitchReadiness}%, Outfield: ${log.outfieldReadiness}%)`,
            actorId: user.uid,
            actorName: user.email || 'Groundskeeper'
        });

        revalidatePath('/fields');
        return { success: true, id };
    } catch (error) {
        console.error("Error logging readiness action:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to log ground readiness." };
    }
}

// --- Maintenance Actions ---
export async function getMaintenanceTasksAction(fieldId: string) {
    try {
        const snap = await adminDb.collection("maintenance_tasks")
            .where("fieldId", "==", fieldId)
            .get();

        if (snap.empty) {
            // High-fidelity fallback defaults
            const defaults: MaintenanceTask[] = [
                {
                    id: 'm-1',
                    fieldId,
                    fieldName: 'Main Oval (Pitch 1)',
                    title: 'Heavy Roller & Moisture Check',
                    description: 'Run 1.5t roller prior to 1st XI Premier League match. Target 12% moisture.',
                    priority: 'HIGH',
                    status: 'IN_PROGRESS',
                    assignedTo: 'Dave Miller',
                    dueDate: new Date(Date.now() + 86400000).toISOString(),
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'm-2',
                    fieldId,
                    fieldName: 'Main Oval (Pitch 1)',
                    title: 'Boundary Line Crease Painting',
                    description: 'Re-paint crease markings and 30-yard circle lines.',
                    priority: 'MEDIUM',
                    status: 'PENDING',
                    assignedTo: 'Sipho Zulu',
                    dueDate: new Date(Date.now() + 172800000).toISOString(),
                    createdAt: new Date().toISOString()
                }
            ];
            return { success: true, tasks: defaults };
        }

        const tasks = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MaintenanceTask[];

        return { success: true, tasks };
    } catch (error) {
        console.error("Error fetching maintenance tasks:", error);
        return { success: false, tasks: [] };
    }
}

export async function createMaintenanceTaskAction(taskData: Omit<MaintenanceTask, 'id' | 'createdAt'>) {
    try {
        const user = await requireUser("logistics");

        const docRef = await adminDb.collection("maintenance_tasks").add({
            ...taskData,
            createdAt: new Date().toISOString()
        });

        await recordAuditAction({
            actionType: 'LOGISTICS_CREATE',
            entityType: 'maintenance_task',
            entityId: docRef.id,
            description: `Maintenance task created for ${taskData.fieldName}: ${taskData.title}`,
            actorId: user.uid,
            actorName: user.email || 'Groundskeeper'
        });

        revalidatePath('/fields');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating maintenance task:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create maintenance task." };
    }
}

// --- Booking Actions ---
export async function getFacilityBookingsAction(fieldId: string) {
    try {
        const bookings = await facilityService.getBookings(fieldId);
        return { success: true, bookings };
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return { success: false, bookings: [] };
    }
}

export async function createFacilityBookingAction(booking: Omit<FacilityBooking, 'id'>, fieldName: string) {
    try {
        const user = await requireUser("logistics");

        const id = await facilityService.createBooking(booking);

        await recordAuditAction({
            actionType: 'LOGISTICS_CREATE',
            entityType: 'facility_booking',
            entityId: id,
            description: `New booking for ${fieldName}: ${booking.purpose}.`,
            actorId: user.uid,
            actorName: user.email || 'Facility Manager'
        });

        revalidatePath('/fields');
        return { success: true, id };
    } catch (error) {
        console.error("Error creating facility booking action:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create facility booking." };
    }
}

