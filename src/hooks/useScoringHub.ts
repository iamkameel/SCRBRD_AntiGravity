import { useMachine } from '@xstate/react';
import { scoringHubMachine } from '@/lib/scoring/scoringHubMachine';
import { useEffect } from 'react';
import {
    getMatchDetailsAction,
    recordBallAction,
    undoLastBallAction,
    endInningsAction,
    updateLivePlayersAction,
    initializeLiveMatchAction
} from '@/app/actions/matchActions';
import { useLiveScore } from '@/hooks/useLiveScore';
import { matchService } from '@/services/matchService';
import { scoringService } from '@/services/scoringService';
import { ScoringAction, Match } from '@/types/firestore';

export function useScoringHub(matchId: string) {
    const { liveScore } = useLiveScore(matchId);
    const [state, send] = useMachine(scoringHubMachine);
    const { context } = state;
    const { loading: scoreLoading } = useLiveScore(matchId);

    // Sync with Firestore Real-time
    useEffect(() => {
        if (!matchId) return;

        // Load static match details first
        async function loadInitialData() {
            try {
                const match = await matchService.getOne(matchId);
                if (match) {
                    // Subscribe to Scoring Actions
                    const unsubscribe = scoringService.subscribeToActions(matchId, (actions) => {
                        send({
                            type: 'DATA_LOADED',
                            match,
                            liveScore: null, // Machine will get this from the other listener or sync event
                            actions
                        });
                    });
                    return unsubscribe;
                } else {
                    send({ type: 'LOAD_ERROR', error: 'Match not found' });
                }
            } catch (err) {
                send({ type: 'LOAD_ERROR', error: (err as Error).message });
            }
        }

        const cleanupPromise = loadInitialData();
        return () => {
            cleanupPromise.then(unsubscribe => unsubscribe && unsubscribe());
        };
    }, [matchId, send]);

    // Sync liveScore from hook to machine
    useEffect(() => {
        if (liveScore) {
            send({ type: 'SYNC_DATA', liveScore, actions: context.actions });
        }
    }, [liveScore, send, context.actions]);

    // Actions Wrapper
    const recordBall = async (ballData: any) => {
        const result = await recordBallAction(matchId, ballData);
        if (result.success) {
            // Machine will auto-update via Firestore listener
        }
        return result;
    };

    const undoBall = async (reason: string) => {
        const result = await undoLastBallAction(matchId, reason);
        return result;
    };

    const endInnings = async () => {
        send({ type: 'END_INNINGS' });
    };

    const confirmEndInnings = async () => {
        const result = await endInningsAction(matchId);
        if (result.success) {
            send({ type: 'CONFIRM_INNING_END' });
        }
        return result;
    };

    const cancelReview = () => {
        send({ type: 'CANCEL_INNING_END' });
    };

    const updatePlayers = async (updates: any) => {
        const result = await updateLivePlayersAction(matchId, updates);
        return result;
    };

    return {
        state,
        send,
        context: state.context,
        isScoring: state.matches('scoring'),
        isBlocked: state.matches('blockedMissingSetup'),
        isReviewing: state.matches('reviewConfirm'),
        recordBall,
        undoBall,
        endInnings,
        confirmEndInnings,
        updatePlayers,
        loading: state.matches('loading') || scoreLoading
    };
}
