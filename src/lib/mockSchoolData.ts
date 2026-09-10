import { School, Team, StaffProfile, Match } from "@/types/firestore";

export const MOCK_SCHOOLS: Record<string, {
    school: School;
    teams: Team[];
    staff: StaffProfile[];
    fixtures: Match[];
    stats: {
        schoolId: string;
        totalTeams: number;
        activePlayers: number;
        coachingStaff: number;
        upcomingFixtures: number;
        lastUpdated: string;
        id: string;
    };
}> = {
    westville: {
        school: {
            id: "westville",
            name: "Westville Boys' High School",
            abbreviation: "WBHS",
            motto: "Incepto Ne Desistam",
            establishmentYear: 1955,
            location: "Westville, Durban",
            address: "Innes Terrace, Westville, 3629",
            contactEmail: "info@wbhs.co.za",
            contactPhone: "+27 31 267 1330",
            logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80",
            brandColors: {
                primary: "#1e3a5f",
                secondary: "#ffd700"
            },
            principal: "Mr. Aaron K. Mcgregor",
            contactName: "Director of Sport",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        teams: [
            {
                id: "wbhs-1st-xi",
                name: "Westville 1st XI",
                abbreviatedName: "WBHS 1st",
                schoolId: "westville",
                suffix: "1st XI",
                teamColors: { primary: "#1e3a5f", secondary: "#ffd700" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "wbhs-2nd-xi",
                name: "Westville 2nd XI",
                abbreviatedName: "WBHS 2nd",
                schoolId: "westville",
                suffix: "2nd XI",
                teamColors: { primary: "#1e3a5f", secondary: "#ffd700" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "wbhs-u15a",
                name: "Westville U15A",
                abbreviatedName: "WBHS U15A",
                schoolId: "westville",
                suffix: "U15A",
                teamColors: { primary: "#1e3a5f", secondary: "#ffd700" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "wbhs-u14a",
                name: "Westville U14A",
                abbreviatedName: "WBHS U14A",
                schoolId: "westville",
                suffix: "U14A",
                teamColors: { primary: "#1e3a5f", secondary: "#ffd700" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        staff: [
            {
                id: "staff-1",
                schoolId: "westville",
                name: "Fabian Lazar",
                title: "Director of Cricket",
                role: "Head Coach",
                email: "flazar@wbhs.co.za",
                imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            },
            {
                id: "staff-2",
                schoolId: "westville",
                name: "Roger Miller",
                title: "High Performance Specialist",
                role: "Other",
                email: "rmiller@wbhs.co.za",
                imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
            },
            {
                id: "staff-3",
                schoolId: "westville",
                name: "Grant Edwards",
                title: "Head of Junior Cricket",
                role: "Other",
                email: "gedwards@wbhs.co.za"
            }
        ],
        fixtures: [
            {
                id: "match-wbhs-kearsney",
                homeTeamId: "Westville 1st XI",
                awayTeamId: "Kearsney 1st XI",
                matchDate: "2026-10-18T09:30:00.000Z",
                venue: "Bowden Oval, Westville",
                matchType: "50-over",
                state: "SCHEDULED",
                status: "scheduled",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "match-wbhs-hilton",
                homeTeamId: "Westville 1st XI",
                awayTeamId: "Hilton 1st XI",
                matchDate: "2026-10-25T09:30:00.000Z",
                venue: "Gilfillan Field, Hilton",
                matchType: "50-over",
                state: "SCHEDULED",
                status: "scheduled",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "match-wbhs-maritzburg",
                homeTeamId: "Westville 1st XI",
                awayTeamId: "Maritzburg College 1st XI",
                matchDate: "2026-11-01T09:30:00.000Z",
                venue: "Goldstones, PMB",
                matchType: "50-over",
                state: "SCHEDULED",
                status: "scheduled",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        stats: {
            schoolId: "westville",
            totalTeams: 14,
            activePlayers: 185,
            coachingStaff: 12,
            upcomingFixtures: 8,
            lastUpdated: new Date().toISOString(),
            id: "stats-westville"
        }
    },
    kearsney: {
        school: {
            id: "kearsney",
            name: "Kearsney College",
            abbreviation: "KC",
            motto: "Carpe Diem",
            establishmentYear: 1921,
            location: "Botha's Hill, KZN",
            address: "Old Main Road, Botha's Hill",
            contactEmail: "sports@kearsney.com",
            contactPhone: "+27 31 765 9600",
            logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80",
            brandColors: {
                primary: "#800000",
                secondary: "#ffffff"
            },
            principal: "Mr. Patrick Bowman",
            contactName: "Director of Sport",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        teams: [
            {
                id: "kearsney-1st-xi",
                name: "Kearsney 1st XI",
                abbreviatedName: "KC 1st",
                schoolId: "kearsney",
                suffix: "1st XI",
                teamColors: { primary: "#800000", secondary: "#ffffff" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        staff: [],
        fixtures: [],
        stats: {
            schoolId: "kearsney",
            totalTeams: 12,
            activePlayers: 150,
            coachingStaff: 10,
            upcomingFixtures: 6,
            lastUpdated: new Date().toISOString(),
            id: "stats-kearsney"
        }
    },
    hilton: {
        school: {
            id: "hilton",
            name: "Hilton College",
            abbreviation: "HC",
            motto: "Orando et Laborando",
            establishmentYear: 1872,
            location: "Hilton, KZN",
            address: "Hilton College Road, Hilton",
            contactEmail: "cricket@hiltoncollege.com",
            contactPhone: "+27 33 383 0100",
            logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&auto=format&fit=crop&q=80",
            brandColors: {
                primary: "#000000",
                secondary: "#ffffff"
            },
            principal: "Mr. George Harris",
            contactName: "Director of Sport",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        teams: [
            {
                id: "hilton-1st-xi",
                name: "Hilton 1st XI",
                abbreviatedName: "HC 1st",
                schoolId: "hilton",
                suffix: "1st XI",
                teamColors: { primary: "#000000", secondary: "#ffffff" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        staff: [],
        fixtures: [],
        stats: {
            schoolId: "hilton",
            totalTeams: 10,
            activePlayers: 140,
            coachingStaff: 9,
            upcomingFixtures: 5,
            lastUpdated: new Date().toISOString(),
            id: "stats-hilton"
        }
    }
};

export function getMockSchoolData(schoolId: string) {
    const normalizedId = schoolId.toLowerCase();
    if (MOCK_SCHOOLS[normalizedId]) {
        return MOCK_SCHOOLS[normalizedId];
    }
    // Generic fallback if not matched
    return {
        school: {
            id: schoolId,
            name: schoolId.charAt(0).toUpperCase() + schoolId.slice(1) + " High School",
            abbreviation: schoolId.substring(0, 4).toUpperCase(),
            motto: "Excellence in Sport and Academics",
            establishmentYear: 1960,
            location: "KwaZulu-Natal",
            address: "School Campus Road",
            contactEmail: `info@${schoolId}.edu`,
            contactPhone: "+27 31 555 0100",
            brandColors: {
                primary: "#1e3a5f",
                secondary: "#00c985"
            },
            principal: "Headmaster",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        teams: [
            {
                id: `${schoolId}-1st-xi`,
                name: `${schoolId.charAt(0).toUpperCase() + schoolId.slice(1)} 1st XI`,
                abbreviatedName: `${schoolId.substring(0, 4).toUpperCase()} 1st`,
                schoolId: schoolId,
                suffix: "1st XI",
                teamColors: { primary: "#1e3a5f", secondary: "#00c985" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ],
        staff: [
            {
                id: "staff-generic-1",
                schoolId: schoolId,
                name: "Coach Director",
                title: "Director of Sport",
                role: "Head Coach" as const,
                email: `sport@${schoolId}.edu`
            }
        ],
        fixtures: [],
        stats: {
            schoolId: schoolId,
            totalTeams: 8,
            activePlayers: 120,
            coachingStaff: 6,
            upcomingFixtures: 4,
            lastUpdated: new Date().toISOString(),
            id: `stats-${schoolId}`
        }
    };
}
