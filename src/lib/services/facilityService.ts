import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Field } from '@/types/firestore';

export interface GroundReadinessLog {
    id?: string;
    fieldId: string;
    fixtureId?: string;
    conditionStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unplayable';
    pitchReadiness: number; // 0-100
    outfieldReadiness: number; // 0-100
    equipmentReadiness: boolean;
    loggedBy: string;
    loggedAt: Timestamp | string;
    notes?: string;
}

export interface FacilityBooking {
    id?: string;
    fieldId: string;
    startTime: Timestamp | string;
    endTime: Timestamp | string;
    purpose: string;
    relatedEntityType?: 'fixture' | 'training';
    relatedEntityId?: string;
    status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export const facilityService = {
    // --- Readiness Logs ---
    getLatestReadinessLog: async (fieldId: string): Promise<GroundReadinessLog | null> => {
        const colRef = collection(db, 'ground_status_logs');
        const q = query(
            colRef,
            where('fieldId', '==', fieldId),
            orderBy('loggedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as GroundReadinessLog;
    },

    logReadiness: async (log: Omit<GroundReadinessLog, 'id'>) => {
        const colRef = collection(db, 'ground_status_logs');
        const docRef = await addDoc(colRef, {
            ...log,
            createdAt: serverTimestamp()
        });

        // Update the field's aggregate status if needed
        const fieldRef = doc(db, 'fields', log.fieldId);
        await updateDoc(fieldRef, {
            status: log.conditionStatus,
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    },

    // --- Bookings ---
    getBookings: async (fieldId: string): Promise<FacilityBooking[]> => {
        const colRef = collection(db, 'facility_bookings');
        const q = query(
            colRef,
            where('fieldId', '==', fieldId),
            orderBy('startTime', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FacilityBooking));
    },

    createBooking: async (booking: Omit<FacilityBooking, 'id'>) => {
        const colRef = collection(db, 'facility_bookings');
        const docRef = await addDoc(colRef, {
            ...booking,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }
};
