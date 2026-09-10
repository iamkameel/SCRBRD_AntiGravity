"use client";

export interface LiveBallEvent {
    id: string;
    overNumber: number;
    ballNumber: number;
    strikerName: string;
    bowlerName: string;
    runsOffBat: number;
    extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye';
    extraRuns: number;
    totalRuns: number;
    isWicket: boolean;
    wicketType?: string;
    dismissedPlayerName?: string;
    shotZone?: string;
    shotRing?: string;
    commentary: string;
    timestamp: string;
}

export interface LiveMatchState {
    fixtureId: string;
    homeTeamName: string;
    awayTeamName: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    battingTeamName: string;
    bowlingTeamName: string;
    totalRuns: number;
    wickets: number;
    oversCompleted: number;
    ballsInOver: number;
    targetRuns?: number;
    requiredRunRate?: number;
    currentRunRate: number;
    striker: {
        name: string;
        runs: number;
        ballsFacing: number;
        fours: number;
        sixes: number;
    };
    nonStriker: {
        name: string;
        runs: number;
        ballsFacing: number;
        fours: number;
        sixes: number;
    };
    currentBowler: {
        name: string;
        overs: number;
        maidens: number;
        runsConceded: number;
        wicketsTaken: number;
    };
    recentBalls: LiveBallEvent[];
    wormData: { over: number; runs: number; wickets: number }[];
    matchStatus: 'LIVE' | 'INNINGS_BREAK' | 'COMPLETED' | 'DELAYED_RAIN';
    statusMessage: string;
}

const DEFAULT_MATCH_STATE: LiveMatchState = {
    fixtureId: 'fix-1st-xi-kes',
    homeTeamName: "St John's College 1st XI",
    awayTeamName: 'King Edward VII School 1st XI',
    battingTeamName: "St John's College 1st XI",
    bowlingTeamName: 'King Edward VII School 1st XI',
    totalRuns: 184,
    wickets: 4,
    oversCompleted: 34,
    ballsInOver: 2,
    targetRuns: 245,
    requiredRunRate: 3.85,
    currentRunRate: 5.38,
    striker: {
        name: 'Aidan Smith',
        runs: 78,
        ballsFacing: 64,
        fours: 9,
        sixes: 2,
    },
    nonStriker: {
        name: 'Luke Davies',
        runs: 34,
        ballsFacing: 42,
        fours: 4,
        sixes: 0,
    },
    currentBowler: {
        name: 'B. Hendricks',
        overs: 6.2,
        maidens: 1,
        runsConceded: 28,
        wicketsTaken: 2,
    },
    recentBalls: [
        {
            id: 'b-1',
            overNumber: 34,
            ballNumber: 2,
            strikerName: 'Aidan Smith',
            bowlerName: 'B. Hendricks',
            runsOffBat: 4,
            extraRuns: 0,
            totalRuns: 4,
            isWicket: false,
            shotZone: 'COVER',
            shotRing: 'BOUNDARY',
            commentary: 'Hendricks pitches up outside off, Aidan Smith leans into a glorious cover drive to the fence for FOUR!',
            timestamp: '14:32:10',
        },
        {
            id: 'b-2',
            overNumber: 34,
            ballNumber: 1,
            strikerName: 'Aidan Smith',
            bowlerName: 'B. Hendricks',
            runsOffBat: 1,
            extraRuns: 0,
            totalRuns: 1,
            isWicket: false,
            shotZone: 'MID_WICKET',
            shotRing: 'INFIELD',
            commentary: 'Worked away off the pads to deep mid-wicket for a single.',
            timestamp: '14:31:40',
        },
    ],
    wormData: [
        { over: 5, runs: 28, wickets: 0 },
        { over: 10, runs: 54, wickets: 1 },
        { over: 15, runs: 79, wickets: 2 },
        { over: 20, runs: 105, wickets: 2 },
        { over: 25, runs: 132, wickets: 3 },
        { over: 30, runs: 158, wickets: 4 },
        { over: 34, runs: 184, wickets: 4 },
    ],
    matchStatus: 'LIVE',
    statusMessage: "St John's College require 61 runs off 94 balls",
};

type StateListener = (state: LiveMatchState) => void;

class LiveMatchSyncService {
    private currentState: LiveMatchState = { ...DEFAULT_MATCH_STATE };
    private listeners: Set<StateListener> = new Set();

    public getLiveState(): LiveMatchState {
        return this.currentState;
    }

    public subscribe(listener: StateListener): () => void {
        this.listeners.add(listener);
        listener(this.currentState);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public updateMatchState(newState: Partial<LiveMatchState>) {
        this.currentState = { ...this.currentState, ...newState };
        this.notify();
    }

    public addBallEvent(event: LiveBallEvent) {
        const updatedRecent = [event, ...this.currentState.recentBalls.slice(0, 9)];
        const newTotalRuns = this.currentState.totalRuns + event.totalRuns;
        const newWickets = event.isWicket ? this.currentState.wickets + 1 : this.currentState.wickets;

        this.currentState = {
            ...this.currentState,
            totalRuns: newTotalRuns,
            wickets: newWickets,
            recentBalls: updatedRecent,
        };
        this.notify();
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.currentState));
    }
}

export const liveMatchSync = new LiveMatchSyncService();
