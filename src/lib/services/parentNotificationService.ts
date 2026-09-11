import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ParentNotification {
    id?: string;
    tripId?: string;
    fixtureId?: string;
    studentId?: string;
    studentName: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail?: string;
    channel: 'SMS' | 'PUSH' | 'WHATSAPP';
    type: 'BOARDED' | 'ABSENT' | 'DEPARTED' | 'ARRIVED' | 'DELAYED' | 'EMERGENCY';
    title: string;
    message: string;
    status: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
    sentAt: Timestamp | string | Date;
}

export const INITIAL_PARENT_NOTIFICATIONS: ParentNotification[] = [
    {
        id: 'pnotif-1',
        tripId: 'TRIP-101',
        studentName: 'Luke Peterson',
        guardianName: 'Sarah Peterson',
        guardianPhone: '+27 82 555 1234',
        channel: 'SMS',
        type: 'BOARDED',
        title: 'Student Boarded Transport',
        message: 'SCRBRD ALERT: Luke Peterson has boarded Mercedes Sprinter V02 departing for Westville Oval.',
        status: 'DELIVERED',
        sentAt: '07:42 AM'
    },
    {
        id: 'pnotif-2',
        tripId: 'TRIP-101',
        studentName: 'Team Squad',
        guardianName: 'All 1st XI Parents',
        guardianPhone: 'Broadcast (11 Recips)',
        channel: 'PUSH',
        type: 'DEPARTED',
        title: 'Squad Transport En Route',
        message: 'SCRBRD LOGISTICS: Westville 1st XI bus V02 has departed Hilton College. ETA Westville Oval: 08:35 AM.',
        status: 'DELIVERED',
        sentAt: '07:50 AM'
    }
];

export const parentNotificationService = {
    // Dispatch a parent notification & log to Firestore
    dispatchNotification: async (notif: Omit<ParentNotification, 'id' | 'sentAt' | 'status'>): Promise<string> => {
        try {
            const colRef = collection(db, 'parent_notifications');
            const docRef = await addDoc(colRef, {
                ...notif,
                status: 'DELIVERED',
                sentAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (err) {
            console.warn("Firestore offline or parent_notifications uninitialized. Using mock ID:", err);
            return `mock-pnotif-${Date.now()}`;
        }
    },

    // Subscribe to parent notifications for a specific trip
    subscribeNotifications: (tripId: string, callback: (notifications: ParentNotification[]) => void) => {
        try {
            const colRef = collection(db, 'parent_notifications');
            const q = query(colRef, where('tripId', '==', tripId), orderBy('sentAt', 'desc'));

            return onSnapshot(q, (snapshot) => {
                if (snapshot.empty) {
                    const fallback = INITIAL_PARENT_NOTIFICATIONS.filter(n => n.tripId === tripId || !n.tripId);
                    callback(fallback);
                    return;
                }
                const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParentNotification));
                callback(notifs);
            }, (error) => {
                console.warn("Firestore parent notifications listener error, falling back to local:", error);
                callback(INITIAL_PARENT_NOTIFICATIONS.filter(n => n.tripId === tripId || !n.tripId));
            });
        } catch (err) {
            console.warn("Firestore error in subscribeNotifications:", err);
            callback(INITIAL_PARENT_NOTIFICATIONS.filter(n => n.tripId === tripId || !n.tripId));
            return () => { };
        }
    },

    // Helper trigger when a student is marked BOARDED
    notifyStudentBoarded: async (tripId: string, studentName: string, vehicleName: string, venueName: string) => {
        return parentNotificationService.dispatchNotification({
            tripId,
            studentName,
            guardianName: `Parent of ${studentName}`,
            guardianPhone: '+27 82 000 0000',
            channel: 'SMS',
            type: 'BOARDED',
            title: `${studentName} Boarded Transport`,
            message: `SCRBRD ALERT: ${studentName} has safely boarded ${vehicleName} bound for ${venueName}.`
        });
    },

    // Helper trigger when student is marked ABSENT
    notifyStudentAbsent: async (tripId: string, studentName: string, vehicleName: string) => {
        return parentNotificationService.dispatchNotification({
            tripId,
            studentName,
            guardianName: `Parent of ${studentName}`,
            guardianPhone: '+27 82 000 0000',
            channel: 'SMS',
            type: 'ABSENT',
            title: `URGENT: ${studentName} Unaccounted at Departure`,
            message: `SCRBRD LOGISTICS: ${studentName} is currently unaccounted for on ${vehicleName} departure manifest. Please contact Head Coach.`
        });
    },

    // Helper trigger when bus status changes to IN TRANSIT
    notifyTripDeparted: async (tripId: string, vehicleName: string, venueName: string, eta: string, count: number) => {
        return parentNotificationService.dispatchNotification({
            tripId,
            studentName: 'Squad Passengers',
            guardianName: `Parents of (${count} Players)`,
            guardianPhone: `Broadcast (${count} Guardians)`,
            channel: 'PUSH',
            type: 'DEPARTED',
            title: `Bus ${vehicleName} En Route`,
            message: `SCRBRD LOGISTICS: Bus ${vehicleName} with ${count} players has departed. En route to ${venueName}. ETA: ${eta}.`
        });
    },

    // Helper trigger when bus status changes to ARRIVED
    notifyTripArrived: async (tripId: string, vehicleName: string, venueName: string) => {
        return parentNotificationService.dispatchNotification({
            tripId,
            studentName: 'Squad Passengers',
            guardianName: 'Squad Guardians',
            guardianPhone: 'Broadcast List',
            channel: 'PUSH',
            type: 'ARRIVED',
            title: `Safe Arrival at ${venueName}`,
            message: `SCRBRD ALERT: Bus ${vehicleName} has arrived safely at ${venueName}. Pre-match warm-ups underway.`
        });
    }
};
