import {
    collection,
    doc,
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

// ─────────────────────────────────────────────────────────────────────────────
// Booking store
//
// The canonical booking store is `fields/{fieldId}/bookings` — the same
// subcollection the Field Booking Calendar (fieldBookingActions) and the
// Turf & Facility Engine read and write. Earlier versions of this service
// wrote to a separate top-level `facility_bookings` collection, which meant
// the two views never saw each other's bookings. Writes now go to the
// subcollection; the legacy collection is still read so old records surface.
// ─────────────────────────────────────────────────────────────────────────────

function asDate(v: Timestamp | string | Date): Date {
    if (v instanceof Date) return v;
    if (v instanceof Timestamp) return v.toDate();
    return new Date(v);
}
const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Map a fields/{id}/bookings doc to the FacilityBooking shape. */
function fromFieldBooking(fieldId: string, id: string, raw: Record<string, unknown>): FacilityBooking {
    const day = raw.date ? asDate(raw.date as Timestamp | string) : new Date();
    const [sh, sm] = String(raw.startTime ?? '08:00').split(':').map(Number);
    const [eh, em] = String(raw.endTime ?? '12:00').split(':').map(Number);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), sh || 0, sm || 0);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), eh || 0, em || 0);
    const type = raw.type as string | undefined;
    return {
        id,
        fieldId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: String(raw.title ?? 'Booking'),
        relatedEntityType: (raw.relatedEntityType as FacilityBooking['relatedEntityType']) ?? (raw.fixtureId ? 'fixture' : type === 'Practice' ? 'training' : undefined),
        relatedEntityId: (raw.relatedEntityId as string | undefined) ?? (raw.fixtureId as string | undefined),
        status: (raw.status as FacilityBooking['status']) ?? 'Confirmed',
    };
}

export const facilityService = {
    // --- Readiness Logs ---
    getLatestReadinessLog: async (fieldId: string): Promise<GroundReadinessLog | null> => {
        // Single `where` + client-side sort: no (fieldId, loggedAt) composite index required.
        const snapshot = await getDocs(query(collection(db, 'ground_status_logs'), where('fieldId', '==', fieldId)));
        if (snapshot.empty) return null;
        const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GroundReadinessLog));
        logs.sort((a, b) => asDate(b.loggedAt).getTime() - asDate(a.loggedAt).getTime());
        return logs[0];
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
        const sub = await getDocs(query(collection(db, 'fields', fieldId, 'bookings'), orderBy('date', 'asc')));
        const canonical = sub.docs.map(d => fromFieldBooking(fieldId, d.id, d.data()));

        let legacy: FacilityBooking[] = [];
        try {
            const snap = await getDocs(query(collection(db, 'facility_bookings'), where('fieldId', '==', fieldId)));
            legacy = snap.docs.map(d => ({ id: d.id, ...d.data() } as FacilityBooking));
        } catch {
            // legacy collection may not exist / be readable — fine
        }

        return [...canonical, ...legacy].sort((a, b) => asDate(a.startTime).getTime() - asDate(b.startTime).getTime());
    },

    createBooking: async (booking: Omit<FacilityBooking, 'id'>) => {
        const start = asDate(booking.startTime);
        const end = asDate(booking.endTime);
        const type = booking.relatedEntityType === 'fixture' ? 'Match' : booking.relatedEntityType === 'training' ? 'Practice' : 'Event';
        const docRef = await addDoc(collection(db, 'fields', booking.fieldId, 'bookings'), {
            date: Timestamp.fromDate(new Date(start.getFullYear(), start.getMonth(), start.getDate())),
            startTime: hhmm(start),
            endTime: hhmm(end),
            title: booking.purpose,
            organizer: 'Facilities',
            type,
            status: booking.status,
            relatedEntityType: booking.relatedEntityType ?? null,
            relatedEntityId: booking.relatedEntityId ?? null,
            fixtureId: booking.relatedEntityType === 'fixture' ? booking.relatedEntityId ?? null : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    }
};
