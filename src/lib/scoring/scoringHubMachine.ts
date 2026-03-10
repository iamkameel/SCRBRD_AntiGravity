import { createMachine, assign } from 'xstate';
import { Match, LiveScoreProjection, ScoringAction } from '@/types/firestore';

export interface ScoringHubContext {
    matchId: string;
    match: Match | null;
    liveScore: LiveScoreProjection | null;
    actions: ScoringAction[];
    error: string | null;
    validationErrors: string[];
}

export type ScoringHubEvent =
    | { type: 'LOAD_DATA'; matchId: string }
    | { type: 'DATA_LOADED'; match: Match; liveScore: LiveScoreProjection | null; actions: ScoringAction[] }
    | { type: 'LOAD_ERROR'; error: string }
    | { type: 'START_SCORING' }
    | { type: 'RECORD_BALL'; ballData: any }
    | { type: 'UNDO_BALL'; reason: string }
    | { type: 'END_INNINGS' }
    | { type: 'CONFIRM_INNING_END' }
    | { type: 'CANCEL_INNING_END' }
    | { type: 'START_NEXT_INNINGS' }
    | { type: 'END_MATCH' }
    | { type: 'SYNC_DATA'; liveScore: LiveScoreProjection | null; actions: ScoringAction[] }
    | { type: 'UPDATE_PLAYERS'; updates: any };

export const scoringHubMachine = createMachine({
    id: 'scoringHub',
    initial: 'idle',
    types: {} as {
        context: ScoringHubContext;
        events: ScoringHubEvent;
    },
    context: {
        matchId: '',
        match: null,
        liveScore: null,
        actions: [],
        error: null,
        validationErrors: []
    },
    states: {
        idle: {
            on: {
                LOAD_DATA: {
                    target: 'loading',
                    actions: assign({
                        matchId: ({ event }) => event.matchId
                    })
                }
            }
        },
        loading: {
            on: {
                DATA_LOADED: {
                    target: 'checkingSetup',
                    actions: assign({
                        match: ({ event }) => event.match,
                        liveScore: ({ event }) => event.liveScore,
                        actions: ({ event }) => event.actions
                    })
                },
                LOAD_ERROR: {
                    target: 'error',
                    actions: assign({
                        error: ({ event }) => event.error
                    })
                }
            }
        },
        checkingSetup: {
            always: [
                {
                    target: 'blockedMissingSetup',
                    guard: ({ context }) => {
                        // Check if toss or players are missing
                        if (!context.match?.tossWinnerId) return true;
                        if (context.liveScore?.status === 'scheduled') return true;
                        return false;
                    }
                },
                {
                    target: 'ready'
                }
            ]
        },
        blockedMissingSetup: {
            on: {
                SYNC_DATA: {
                    target: 'checkingSetup',
                    actions: assign({
                        liveScore: ({ event }) => event.liveScore,
                        actions: ({ event }) => event.actions
                    })
                },
                START_SCORING: {
                    target: 'scoring',
                    guard: ({ context }) => {
                        return !!context.match?.tossWinnerId && !!context.liveScore?.currentPlayers?.strikerId;
                    }
                }
            }
        },
        ready: {
            on: {
                START_SCORING: 'scoring',
                SYNC_DATA: {
                    actions: assign({
                        liveScore: ({ event }) => event.liveScore,
                        actions: ({ event }) => event.actions
                    })
                }
            }
        },
        scoring: {
            on: {
                RECORD_BALL: {
                    actions: 'notifyRecording'
                },
                UNDO_BALL: {
                    actions: 'notifyUndo'
                },
                SYNC_DATA: {
                    actions: assign({
                        liveScore: ({ event }) => event.liveScore,
                        actions: ({ event }) => event.actions
                    })
                },
                END_INNINGS: 'reviewConfirm'
            }
        },
        reviewConfirm: {
            on: {
                CONFIRM_INNING_END: 'inningsComplete',
                CANCEL_INNING_END: 'scoring'
            }
        },
        inningsComplete: {
            on: {
                START_NEXT_INNINGS: 'ready',
                END_MATCH: 'matchComplete'
            }
        },
        matchComplete: {
            type: 'final'
        },
        error: {
            on: {
                LOAD_DATA: 'loading'
            }
        }
    }
});
