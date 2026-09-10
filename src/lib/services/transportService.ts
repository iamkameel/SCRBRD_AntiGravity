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
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Vehicle {
    id?: string;
    schoolId: string;
    registration: string;
    makeModel: string;
    type: 'Bus' | 'Van' | 'Car';
    capacity: number;
    status: 'Active' | 'Maintenance' | 'Out of Service';
    currentLoad?: number; // %
    assignedDriver?: string;
    lastServiceDate?: Timestamp | string;
}

export interface TransportTrip {
    id?: string;
    fixtureId: string;
    fixture?: string; // For display
    teamId: string;
    vehicleId: string;
    driverId: string;
    driverName?: string;
    destination: string;
    scheduledDeparture: Timestamp | string;
    scheduledArrival: Timestamp | string;
    actualDeparture?: Timestamp | string;
    actualArrival?: Timestamp | string;
    status: 'Scheduled' | 'Ready' | 'In Transit' | 'Delayed' | 'Completed' | 'Cancelled';
    passengerCount: number;
    routeStops?: string[];
    createdAt?: any;
}

export const transportService = {
    // --- Vehicle Operations ---
    getVehicles: async (schoolId?: string): Promise<Vehicle[]> => {
        const colRef = collection(db, 'vehicles');
        let q = query(colRef, orderBy('makeModel'));

        if (schoolId) {
            q = query(colRef, where('schoolId', '==', schoolId), orderBy('makeModel'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    },

    updateVehicleStatus: async (id: string, status: Vehicle['status'], load?: number) => {
        const docRef = doc(db, 'vehicles', id);
        await updateDoc(docRef, {
            status,
            ...(load !== undefined && { currentLoad: load }),
            updatedAt: serverTimestamp()
        });
    },

    // --- Trip Operations ---
    getUpcomingTrips: async (schoolId?: string): Promise<TransportTrip[]> => {
        const colRef = collection(db, 'transport_trips');
        // For now, get all scheduled/ready/transit trips
        const q = query(
            colRef,
            where('status', 'in', ['Scheduled', 'Ready', 'In Transit', 'Delayed']),
            orderBy('scheduledDeparture', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
    },

    createTrip: async (trip: Omit<TransportTrip, 'id'>) => {
        const colRef = collection(db, 'transport_trips');
        const docRef = await addDoc(colRef, {
            ...trip,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    updateTripStatus: async (id: string, status: TransportTrip['status']) => {
        const docRef = doc(db, 'transport_trips', id);
        await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    },

    getTripsByFixtures: async (fixtureIds: string[]): Promise<TransportTrip[]> => {
        if (fixtureIds.length === 0) return [];
        const colRef = collection(db, 'transport_trips');
        // Firestore 'in' query supports up to 10-30 items depending on version, 
        // usually 10 for basic queries.
        const q = query(
            colRef,
            where('fixtureId', 'in', fixtureIds.slice(0, 10))
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
    },

    getDriverTrips: async (driverId: string): Promise<TransportTrip[]> => {
        const colRef = collection(db, 'transport_trips');
        const q = query(
            colRef,
            where('driverId', '==', driverId),
            orderBy('scheduledDeparture', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
    }
};
