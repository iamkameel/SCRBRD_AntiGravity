'use server';

import { revalidatePath } from 'next/cache';
import admin from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireUser } from '@/lib/auth/session';

export interface CapacityLogData {
    occupancy: number;
    date: Date | string;
    eventId?: string;
    recordedBy?: string;
}

export async function logCapacityAction(fieldId: string, data: CapacityLogData) {
    try {
        await requireUser('fields');
        const capacityRef = admin.firestore()
            .collection('fields')
            .doc(fieldId)
            .collection('capacityHistory')
            .doc();

        const logEntry = {
            occupancy: data.occupancy,
            date: data.date instanceof Date
                ? Timestamp.fromDate(data.date)
                : Timestamp.fromDate(new Date(data.date)),
            eventId: data.eventId || null,
            recordedBy: data.recordedBy || 'System',
            createdAt: Timestamp.now()
        };

        await capacityRef.set(logEntry);

        revalidatePath(`/fields/${fieldId}`);

        return { success: true, id: capacityRef.id };
    } catch (error) {
        console.error('logCapacityAction error:', error);
        return { success: false, error: (error as Error).message || 'Failed to log capacity' };
    }
}

export async function getCapacityHistoryAction(
    fieldId: string,
    startDate?: Date,
    endDate?: Date
) {
    try {
        let query = admin.firestore()
            .collection('fields')
            .doc(fieldId)
            .collection('capacityHistory')
            .orderBy('date', 'asc');

        if (startDate) {
            query = query.where('date', '>=', Timestamp.fromDate(startDate));
        }

        if (endDate) {
            query = query.where('date', '<=', Timestamp.fromDate(endDate));
        }

        const snapshot = await query.get();

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: (doc.data().date as Timestamp).toDate().toISOString()
        }));

        return { success: true, history };
    } catch (error) {
        console.error('getCapacityHistoryAction error:', error);
        return { success: false, error: (error as Error).message || 'Failed to fetch capacity history', history: [] };
    }
}
