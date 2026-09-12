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

export type ConcussionStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface ConcussionRtpRecord {
    id: string;
    personId: string;
    personName: string;
    teamName: string;
    injuryDate: string;
    scat6BaselineScore: number;
    scat6CurrentScore: number;
    currentStage: ConcussionStage;
    stageName: string;
    minimumRestDaysRemaining: number;
    treatingDoctorName: string;
    doctorLicenseNumber: string;
    clearedForNextStage: boolean;
    stageHistory: {
        stage: ConcussionStage;
        completedAt: string;
        approvedBy: string;
        notes: string;
    }[];
}

export interface MedicalIncident {
    id?: string;
    personId: string;
    personName: string;
    teamName?: string;
    fixtureId?: string;
    type: string;
    bodyPart?: 'HEAD' | 'SHOULDER' | 'ELBOW_WRIST' | 'HAMSTRING' | 'KNEE' | 'ANKLE_FOOT' | 'SPINE';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Reported' | 'Treated' | 'Rehab' | 'Cleared';
    description: string;
    treatmentAdministered?: string;
    estimatedReturnDays?: number;
    reportedBy: string;
    reportedAt: Timestamp | string;
    updatedAt?: Timestamp | string;
    clearanceCode?: string;
    clearanceDoctor?: string;
}

export const MOCK_CONCUSSION_RECORDS: ConcussionRtpRecord[] = [
    {
        id: 'rtp-c01',
        personId: 'p-aidan-smith',
        personName: 'Aidan Smith',
        teamName: "St John's College 1st XI",
        injuryDate: '2026-09-02',
        scat6BaselineScore: 4,
        scat6CurrentScore: 18,
        currentStage: 3,
        stageName: 'Sport-Specific Non-Contact Drills',
        minimumRestDaysRemaining: 2,
        treatingDoctorName: 'Dr. Sarah Van Der Merwe (Sports Physician)',
        doctorLicenseNumber: 'MP-0482910',
        clearedForNextStage: true,
        stageHistory: [
            { stage: 1, completedAt: '2026-09-04', approvedBy: 'Dr. S. Van Der Merwe', notes: 'Initial cognitive & physical rest achieved. Headaches resolved.' },
            { stage: 2, completedAt: '2026-09-07', approvedBy: 'Dr. S. Van Der Merwe', notes: 'Light stationary bike 20 mins @ 65% Max HR without symptom exacerbation.' },
            { stage: 3, completedAt: '2026-09-10', approvedBy: 'Lead Clinician', notes: 'Shadow batting and shuttle runs completed cleanly.' }
        ]
    },
    {
        id: 'rtp-c02',
        personId: 'p-michael-lombard',
        personName: 'Michael Lombard',
        teamName: 'King Edward VII School 1st XI',
        injuryDate: '2026-09-08',
        scat6BaselineScore: 2,
        scat6CurrentScore: 34,
        currentStage: 1,
        stageName: 'Initial Physical & Cognitive Rest',
        minimumRestDaysRemaining: 5,
        treatingDoctorName: 'Dr. T. Khumalo (Neurologist)',
        doctorLicenseNumber: 'MP-0912834',
        clearedForNextStage: false,
        stageHistory: [
            { stage: 1, completedAt: 'Pending', approvedBy: 'Dr. T. Khumalo', notes: 'Slight dizziness present during light screen reading. Rest extended.' }
        ]
    }
];

export const MOCK_MEDICAL_INCIDENTS: MedicalIncident[] = [
    {
        id: 'med-inc-101',
        personId: 'p-aidan-smith',
        personName: 'Aidan Smith',
        teamName: "St John's College 1st XI",
        type: 'CONCUSSION / HIA',
        bodyPart: 'HEAD',
        severity: 'High',
        status: 'Rehab',
        description: 'Sustained head impact while diving in the outfield. Mild disorientation logged. GRTP Concussion Protocol Stage 3 initiated.',
        treatmentAdministered: 'Cervical spine triage, SCAT6 assessment, mandatory 14-day GRTP window.',
        estimatedReturnDays: 6,
        reportedBy: 'Dr. S. Van Der Merwe',
        reportedAt: '2026-09-02T14:30:00Z',
        clearanceCode: 'RTP-GRTP-2026-881'
    },
    {
        id: 'med-inc-102',
        personId: 'p-david-kahn',
        personName: 'David Kahn',
        teamName: "St John's College 1st XI",
        type: 'SOFT TISSUE',
        bodyPart: 'HAMSTRING',
        severity: 'Medium',
        status: 'Rehab',
        description: 'Grade 1 biceps femoris strain during bowling workload session.',
        treatmentAdministered: 'ICE protocol, eccentric hamstring strengthening, GPS velocity cap at 75%.',
        estimatedReturnDays: 10,
        reportedBy: 'Physio Mark Taylor',
        reportedAt: '2026-09-05T09:15:00Z'
    },
    {
        id: 'med-inc-103',
        personId: 'p-kyle-bennett',
        personName: 'Kyle Bennett',
        teamName: 'Bishopy U16A',
        type: 'BONE / JOINT',
        bodyPart: 'ANKLE_FOOT',
        severity: 'Low',
        status: 'Cleared',
        description: 'Lateral ankle inversion sprain during fielding drills. Fully cleared following functional agility battery.',
        treatmentAdministered: 'Proprioceptive rehab, rigid strapping for match play.',
        estimatedReturnDays: 0,
        reportedBy: 'Dr. S. Van Der Merwe',
        reportedAt: '2026-08-28T16:00:00Z',
        clearanceCode: 'MED-CLR-2026-044',
        clearanceDoctor: 'Dr. Sarah Van Der Merwe'
    }
];

export const medicalService = {
    getIncidents: async (personId?: string): Promise<MedicalIncident[]> => {
        try {
            const colRef = collection(db, 'medical_incidents');
            let q = query(colRef, orderBy('reportedAt', 'desc'));

            if (personId) {
                q = query(colRef, where('personId', '==', personId), orderBy('reportedAt', 'desc'));
            }

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalIncident));
            }
        } catch (err) {
            console.warn('[MedicalService] Firestore fetch fallback to mock memory incidents:', err);
        }
        return MOCK_MEDICAL_INCIDENTS;
    },

    getConcussionRecords: async (): Promise<ConcussionRtpRecord[]> => {
        try {
            const colRef = collection(db, 'concussion_rtp_records');
            const snapshot = await getDocs(colRef);
            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConcussionRtpRecord));
            }
        } catch (err) {
            console.warn('[MedicalService] Concussion fetch fallback:', err);
        }
        return MOCK_CONCUSSION_RECORDS;
    },

    logIncident: async (incident: Omit<MedicalIncident, 'id'>) => {
        try {
            const colRef = collection(db, 'medical_incidents');
            const docRef = await addDoc(colRef, {
                ...incident,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (err) {
            console.warn('[MedicalService] Log incident local memory update fallback:', err);
            return `local-inc-${Date.now()}`;
        }
    },

    updateIncidentStatus: async (id: string, status: MedicalIncident['status']) => {
        try {
            const docRef = doc(db, 'medical_incidents', id);
            await updateDoc(docRef, {
                status,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.warn('[MedicalService] Update status fallback:', err);
        }
    },

    advanceConcussionStage: async (recordId: string, nextStage: ConcussionStage, approvedBy: string, notes: string) => {
        try {
            const docRef = doc(db, 'concussion_rtp_records', recordId);
            await updateDoc(docRef, {
                currentStage: nextStage,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.warn('[MedicalService] Concussion stage update local fallback:', err);
        }
    }
};
