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
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Vehicle {
    id?: string;
    schoolId: string;
    registration: string;
    makeModel: string;
    type: 'Bus' | 'Van' | 'Car' | 'Minibus';
    capacity: number;
    status: 'Active' | 'Maintenance' | 'Out of Service' | 'AVAILABLE' | 'IN TRANSIT' | 'MAINTENANCE';
    currentLoad?: number; // %
    mileage?: string;
    health?: number;
    lastService?: string;
    assignedDriver?: string;
    lastServiceDate?: Timestamp | string;
}

export interface Passenger {
    id: string;
    personId?: string;
    name?: string;
    role?: string;
    roleOnTrip?: 'Player' | 'Coach' | 'Staff' | 'Driver' | 'Captain' | 'Physio' | 'Manager';
    status: 'Pending' | 'Boarded' | 'Absent' | 'AWAITING' | 'BOARDED' | 'ABSENT';
    seatNumber?: string | number;
    contact?: string;
    emergencyPhone?: string;
    parentPhone?: string;
    parentEmail?: string;
}

export interface TransportTrip {
    id?: string;
    fixtureId?: string;
    fixture?: string; // For display
    destination: string;
    teamId?: string;
    vehicleId: string;
    vehicleName?: string;
    driverId?: string;
    driver?: string;
    driverName?: string;
    driverPhone?: string;
    time?: string;
    departureTime?: string;
    arrivalTime?: string;
    returnTime?: string;
    scheduledDeparture?: Timestamp | string;
    scheduledArrival?: Timestamp | string;
    actualDeparture?: Timestamp | string;
    actualArrival?: Timestamp | string;
    status: 'Scheduled' | 'Ready' | 'In Transit' | 'Delayed' | 'Completed' | 'Cancelled' | 'DRAFT' | 'CONFIRMED' | 'READY FOR DEPARTURE' | 'ARRIVED' | 'IN TRANSIT';
    passengerCount?: number;
    passengers?: Passenger[];
    routeStops?: string[];
    createdAt?: any;
}

export const transportService = {
    // --- Vehicle Operations ---
    getVehicles: async (schoolId?: string): Promise<Vehicle[]> => {
        try {
            const colRef = collection(db, 'vehicles');
            let q = query(colRef, orderBy('makeModel'));

            if (schoolId) {
                q = query(colRef, where('schoolId', '==', schoolId), orderBy('makeModel'));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
        } catch (error) {
            console.warn('getVehicles query failed:', error);
            return [];
        }
    },

    addVehicle: async (vehicle: Omit<Vehicle, 'id'>) => {
        const colRef = collection(db, 'vehicles');
        const docRef = await addDoc(colRef, {
            ...vehicle,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    updateVehicleStatus: async (id: string, status: Vehicle['status'], load?: number) => {
        const docRef = doc(db, 'vehicles', id);
        await updateDoc(docRef, {
            status,
            ...(load !== undefined && { currentLoad: load }),
            updatedAt: serverTimestamp()
        });
    },

    subscribeVehicles: (callback: (vehicles: Vehicle[]) => void, schoolId?: string) => {
        try {
            const colRef = collection(db, 'vehicles');
            let q = query(colRef);
            if (schoolId) {
                q = query(colRef, where('schoolId', '==', schoolId));
            }
            return onSnapshot(q, (snapshot) => {
                const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
                callback(vehicles);
            }, (error) => {
                console.warn('subscribeVehicles snapshot notice:', error?.message);
            });
        } catch (err) {
            console.warn('subscribeVehicles failed:', err);
            return () => { };
        }
    },

    // --- Trip Operations ---
    getUpcomingTrips: async (schoolId?: string): Promise<TransportTrip[]> => {
        try {
            const colRef = collection(db, 'transport_trips');
            const snapshot = await getDocs(colRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
        } catch (error: any) {
            console.warn('getUpcomingTrips query failed (using safe fallback):', error?.message || error);
            return [];
        }
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

    updateTrip: async (id: string, updates: Partial<TransportTrip>) => {
        const docRef = doc(db, 'transport_trips', id);
        await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    },

    subscribeTrips: (callback: (trips: TransportTrip[]) => void) => {
        try {
            const colRef = collection(db, 'transport_trips');
            return onSnapshot(colRef, (snapshot) => {
                const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
                callback(trips);
            }, (error) => {
                console.warn('subscribeTrips snapshot notice:', error?.message);
            });
        } catch (err) {
            console.warn('subscribeTrips failed:', err);
            return () => { };
        }
    },

    getTripsByFixtures: async (fixtureIds: string[]): Promise<TransportTrip[]> => {
        if (fixtureIds.length === 0) return [];
        try {
            const colRef = collection(db, 'transport_trips');
            const q = query(
                colRef,
                where('fixtureId', 'in', fixtureIds.slice(0, 10))
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
        } catch (error: any) {
            console.warn('getTripsByFixtures query failed:', error?.message || error);
            return [];
        }
    },

    getDriverTrips: async (driverId: string): Promise<TransportTrip[]> => {
        try {
            const colRef = collection(db, 'transport_trips');
            const q = query(colRef, where('driverId', '==', driverId));
            const snapshot = await getDocs(q);
            const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportTrip));
            return trips;
        } catch (error: any) {
            console.warn('getDriverTrips query failed:', error?.message || error);
            return [];
        }
    },

    // --- Passenger Manifest Operations ---
    addTripPassenger: async (tripId: string, personId: string, roleOnTrip: 'Player' | 'Coach' | 'Staff' | 'Driver' | 'Captain' | 'Physio' | 'Manager', boardingStatus: 'Pending' | 'Boarded' | 'Absent' | 'AWAITING' = 'Pending') => {
        const colRef = collection(db, 'trip_passengers');
        const docRef = await addDoc(colRef, {
            tripId,
            personId,
            roleOnTrip,
            boardingStatus,
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    },

    updatePassengerStatus: async (passengerId: string, boardingStatus: string) => {
        const docRef = doc(db, 'trip_passengers', passengerId);
        await updateDoc(docRef, { boardingStatus, updatedAt: serverTimestamp() });
    },

    getTripPassengers: async (tripId: string) => {
        try {
            const colRef = collection(db, 'trip_passengers');
            const q = query(colRef, where('tripId', '==', tripId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.warn('getTripPassengers error:', err);
            return [];
        }
    },

    subscribePassengers: (tripId: string, callback: (passengers: any[]) => void) => {
        try {
            const colRef = collection(db, 'trip_passengers');
            const q = query(colRef, where('tripId', '==', tripId));
            return onSnapshot(q, (snapshot) => {
                const passengers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(passengers);
            }, (error) => {
                console.warn('subscribePassengers snapshot notice:', error?.message);
            });
        } catch (err) {
            console.warn('subscribePassengers failed:', err);
            return () => { };
        }
    }
};


