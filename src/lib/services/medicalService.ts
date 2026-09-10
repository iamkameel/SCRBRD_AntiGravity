import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MedicalIncident {
    id?: string;
    personId: string;
    personName: string;
    fixtureId?: string;
    type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Reported' | 'Treated' | 'Rehab' | 'Cleared';
    description: string;
    treatmentAdministered?: string;
    reportedBy: string;
    reportedAt: Timestamp | string;
    updatedAt?: Timestamp | string;
}

export const medicalService = {
    getIncidents: async (personId?: string): Promise<MedicalIncident[]> => {
        const colRef = collection(db, 'medical_incidents');
        let q = query(colRef, orderBy('reportedAt', 'desc'));

        if (personId) {
            q = query(colRef, where('personId', '==', personId), orderBy('reportedAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalIncident));
    },

    logIncident: async (incident: Omit<MedicalIncident, 'id'>) => {
        const colRef = collection(db, 'medical_incidents');
        const docRef = await addDoc(colRef, {
            ...incident,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    updateIncidentStatus: async (id: string, status: MedicalIncident['status']) => {
        const docRef = doc(db, 'medical_incidents', id);
        await addDoc(collection(db, 'medical_notes'), {
            incidentId: id,
            action: 'Status Change',
            newStatus: status,
            timestamp: serverTimestamp()
        });
        // This is a placeholder for actual status update in the main doc
        // In a full implementation, we'd update the incident doc too.
    }
};
