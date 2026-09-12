import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    setDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ParentRSVP {
    id?: string;
    fixtureId: string;
    studentId: string;
    studentName: string;
    guardianName: string;
    guardianPhone: string;
    attendanceStatus: 'ATTENDING_LIVE' | 'WATCHING_REMOTE' | 'UNABLE_TO_ATTEND';
    transportMode: 'TEAM_BUS' | 'SELF_DRIVE_PARENT' | 'CARPOOL_OTHER';
    dietaryMedicalNotes?: string;
    updatedAt: string;
}

export interface ChildProfileDigest {
    studentId: string;
    studentName: string;
    schoolName: string;
    teamName: string;
    roleArchetype: string;
    battingStyle: string;
    bowlingStyle: string;
    seasonStats: {
        matchesPlayed: number;
        runsScored: number;
        battingAverage: number;
        strikeRate: number;
        highestScore: string;
        wicketsTaken: number;
        bowlingEconomy: number;
        catches: number;
        stumpings: number;
    };
    milestonesAchieved: Array<{
        id: string;
        title: string;
        date: string;
        badgeType: 'RUNS' | 'WICKETS' | 'AWARD' | 'DEBUT';
    }>;
    nextFixture: {
        fixtureId: string;
        opponentName: string;
        fixtureDate: string;
        venueName: string;
        venueAddress: string;
        selectionStatus: 'SELECTED_XI' | 'RESERVE_12TH' | 'STANDBY' | 'NOT_SELECTED';
        transportStatus: 'BOARDED' | 'BOOKED' | 'NOT_REQUIRED';
        departureTime: string;
    };
}

export interface NotificationPreference {
    studentId: string;
    guardianPhone: string;
    guardianEmail: string;
    pushEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    alertTypes: {
        transportAlerts: boolean;
        squadAnnouncements: boolean;
        liveWicketsAndMilestones: boolean;
        postMatchRecap: boolean;
    };
}

// Fallback catalog mock data for smooth offline/first-load experience
export const MOCK_CHILD_PROFILES: ChildProfileDigest[] = [
    {
        studentId: 'child-101',
        studentName: 'Aidan Smith',
        schoolName: 'St Stithians College',
        teamName: '1st XI Squad',
        roleArchetype: 'Opener / Top-Order Anchor',
        battingStyle: 'Right-Hand Bat',
        bowlingStyle: 'Right-Arm Off-Break',
        seasonStats: {
            matchesPlayed: 12,
            runsScored: 458,
            battingAverage: 45.8,
            strikeRate: 124.5,
            highestScore: '104*',
            wicketsTaken: 8,
            bowlingEconomy: 4.8,
            catches: 6,
            stumpings: 0
        },
        milestonesAchieved: [
            { id: 'm-1', title: 'Maiden 1st XI Century (104* vs KES)', date: '2026-02-14', badgeType: 'RUNS' },
            { id: 'm-2', title: '500 Career School Runs', date: '2026-03-01', badgeType: 'RUNS' },
            { id: 'm-3', title: 'Player of the Match vs Jeppe', date: '2026-03-07', badgeType: 'AWARD' }
        ],
        nextFixture: {
            fixtureId: 'fix-201',
            opponentName: 'King Edward VII School (KES)',
            fixtureDate: 'Saturday, 14 Sept 2026 • 09:00 AM',
            venueName: 'Main Oval (Turf 1)',
            venueAddress: '40 Peter Place, Bryanston, Johannesburg',
            selectionStatus: 'SELECTED_XI',
            transportStatus: 'NOT_REQUIRED',
            departureTime: '08:00 AM Warm-up'
        }
    },
    {
        studentId: 'child-102',
        studentName: 'Luke Davies',
        schoolName: 'St Stithians College',
        teamName: 'U15A Squad',
        roleArchetype: 'Middle-Order Stabiliser',
        battingStyle: 'Right-Hand Bat',
        bowlingStyle: 'Right-Arm Medium Fast',
        seasonStats: {
            matchesPlayed: 10,
            runsScored: 284,
            battingAverage: 35.5,
            strikeRate: 108.2,
            highestScore: '68',
            wicketsTaken: 14,
            bowlingEconomy: 4.2,
            catches: 4,
            stumpings: 0
        },
        milestonesAchieved: [
            { id: 'm-4', title: '5-Wicket Haul (5/22 vs Pretoria Boys)', date: '2026-02-21', badgeType: 'WICKETS' },
            { id: 'm-5', title: 'U15A Squad Debut', date: '2026-01-18', badgeType: 'DEBUT' }
        ],
        nextFixture: {
            fixtureId: 'fix-202',
            opponentName: 'Hilton College',
            fixtureDate: 'Saturday, 14 Sept 2026 • 08:30 AM',
            venueName: 'Hilton Oval (Away)',
            venueAddress: 'Hilton College Rd, Hilton, KwaZulu-Natal',
            selectionStatus: 'SELECTED_XI',
            transportStatus: 'BOOKED',
            departureTime: '06:30 AM Team Bus'
        }
    }
];

export const MOCK_NOTIF_PREFS: Record<string, NotificationPreference> = {
    'child-101': {
        studentId: 'child-101',
        guardianPhone: '+27 82 555 1234',
        guardianEmail: 'sarah.smith@example.com',
        pushEnabled: true,
        smsEnabled: true,
        whatsappEnabled: true,
        alertTypes: {
            transportAlerts: true,
            squadAnnouncements: true,
            liveWicketsAndMilestones: true,
            postMatchRecap: true
        }
    }
};

export const communityService = {
    // Fetch child profiles for parent dashboard
    getChildProfiles: async (): Promise<ChildProfileDigest[]> => {
        try {
            const colRef = collection(db, 'child_profiles');
            const snapshot = await getDocs(colRef);
            if (snapshot.empty) return MOCK_CHILD_PROFILES;
            return snapshot.docs.map((doc) => doc.data() as ChildProfileDigest);
        } catch (err) {
            console.warn("Firestore error fetching child profiles, using mock:", err);
            return MOCK_CHILD_PROFILES;
        }
    },

    // Save parent RSVP to Firestore
    saveParentRSVP: async (rsvp: ParentRSVP): Promise<void> => {
        try {
            const docId = `${rsvp.fixtureId}_${rsvp.studentId}`;
            const docRef = doc(db, 'community_rsvps', docId);
            await setDoc(docRef, {
                ...rsvp,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.warn("Firestore saveParentRSVP failed, logged locally:", err);
        }
    },

    // Subscribe to live RSVPs for a fixture
    subscribeFixtureRSVPs: (fixtureId: string, callback: (rsvps: ParentRSVP[]) => void) => {
        try {
            const colRef = collection(db, 'community_rsvps');
            const q = query(colRef, where('fixtureId', '==', fixtureId));
            return onSnapshot(q, (snapshot) => {
                const rsvps = snapshot.docs.map((doc) => doc.data() as ParentRSVP);
                callback(rsvps);
            }, (error) => {
                console.warn("Firestore RSVP listener error:", error);
                callback([]);
            });
        } catch (err) {
            console.warn("Firestore error in subscribeFixtureRSVPs:", err);
            callback([]);
            return () => { };
        }
    },

    // Save parent notification preferences
    saveNotificationPreferences: async (prefs: NotificationPreference): Promise<void> => {
        try {
            const docRef = doc(db, 'community_notif_prefs', prefs.studentId);
            await setDoc(docRef, {
                ...prefs,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.warn("Firestore saveNotificationPreferences failed:", err);
        }
    }
};
