import { Person, Team, School } from '../types/firestore';

export const TEST_SCHOOL_ALPHA: Partial<School> = {
    name: "Test School Alpha",
    abbreviation: "TSA",
    location: "Cape Town, South Africa",
    logoUrl: "https://api.placeholder.com/150/22c55e/ffffff?text=TSA"
};

export const TEST_SCHOOL_BETA: Partial<School> = {
    name: "Test School Beta",
    abbreviation: "TSB",
    location: "Johannesburg, South Africa",
    logoUrl: "https://api.placeholder.com/150/ef4444/ffffff?text=TSB"
};

export const ALPHA_LIONS: Partial<Team> = {
    name: "Alpha Lions",
    abbreviatedName: "LIONS",
    nickname: "The Prid",
    teamColors: { primary: "#22c55e", secondary: "#166534" }
};

export const BETA_TIGERS: Partial<Team> = {
    name: "Beta Tigers",
    abbreviatedName: "TIGERS",
    nickname: "The Stripes",
    teamColors: { primary: "#ef4444", secondary: "#991b1b" }
};

export const LIONS_PLAYERS: Partial<Person>[] = [
    { firstName: "Aiden", lastName: "Lioen", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Benjamin", lastName: "King", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Charlie", lastName: "Prid", playingRole: "Wicketkeeper", battingHand: "LHB", status: "active" },
    { firstName: "Daniel", lastName: "Mane", playingRole: "AllRounder", battingHand: "RHB", bowlingStyle: "Right-arm Fast", status: "active" },
    { firstName: "Ethan", lastName: "Roar", playingRole: "AllRounder", battingHand: "RHB", bowlingStyle: "Right-arm Offbreak", status: "active" },
    { firstName: "Felix", lastName: "Sharp", playingRole: "Bowler", bowlingStyle: "Right-arm Fast-medium", status: "active" },
    { firstName: "George", lastName: "Hunter", playingRole: "Bowler", bowlingStyle: "Right-arm Legbreak", status: "active" },
    { firstName: "Henry", lastName: "Claw", playingRole: "Bowler", bowlingStyle: "Left-arm Orthodox", status: "active" },
    { firstName: "Isaac", lastName: "Gold", playingRole: "Bowler", bowlingStyle: "Right-arm Medium", status: "active" },
    { firstName: "Jack", lastName: "Wild", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Kevin", lastName: "Savanna", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Leo", lastName: "Nils", playingRole: "Batsman", battingHand: "LHB", status: "active" },
];

export const TIGERS_PLAYERS: Partial<Person>[] = [
    { firstName: "Thomas", lastName: "Stripe", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Umar", lastName: "Fierce", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Victor", lastName: "Claw", playingRole: "Wicketkeeper", battingHand: "RHB", status: "active" },
    { firstName: "William", lastName: "Pounce", playingRole: "AllRounder", battingHand: "LHB", bowlingStyle: "Right-arm Fast", status: "active" },
    { firstName: "Xavier", lastName: "Orange", playingRole: "AllRounder", battingHand: "RHB", bowlingStyle: "Left-arm Medium", status: "active" },
    { firstName: "Yusuf", lastName: "Shadow", playingRole: "Bowler", bowlingStyle: "Left-arm Fast", status: "active" },
    { firstName: "Zane", lastName: "Black", playingRole: "Bowler", bowlingStyle: "Right-arm Offbreak", status: "active" },
    { firstName: "Aaron", lastName: "Bite", playingRole: "Bowler", bowlingStyle: "Right-arm Medium", status: "active" },
    { firstName: "Bob", lastName: "Tail", playingRole: "Bowler", bowlingStyle: "Right-arm Fast-medium", status: "active" },
    { firstName: "Chris", lastName: "Growl", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "David", lastName: "Fang", playingRole: "Batsman", battingHand: "RHB", status: "active" },
    { firstName: "Eric", lastName: "Jungle", playingRole: "Batsman", battingHand: "LHB", status: "active" },
];
