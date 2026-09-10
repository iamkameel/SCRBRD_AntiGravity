import { describe, it, expect } from 'vitest';
import { replayInningsEvents, formatOversDisplay } from '../replayEngine';
import { BallEvent } from '@/types/schema_v4';

describe('replayEngine', () => {
    it('formats overs display correctly', () => {
        expect(formatOversDisplay(0)).toBe('0.0');
        expect(formatOversDisplay(4)).toBe('0.4');
        expect(formatOversDisplay(6)).toBe('1.0');
        expect(formatOversDisplay(13)).toBe('2.1');
    });

    it('replays a standard over with runs, dot balls, and boundaries', () => {
        const events: BallEvent[] = [
            {
                id: 'b1',
                inningsId: 'inn1',
                overId: 'o1',
                overNumber: 0,
                ballInOver: 1,
                ballSequenceGlobal: 1,
                strikerPersonId: 'p_striker',
                nonStrikerPersonId: 'p_non_striker',
                bowlerPersonId: 'p_bowler',
                battingTeamId: 'teamA',
                bowlingTeamId: 'teamB',
                outcomeType: 'Runs',
                runsBat: 0,
                runsExtras: 0,
                runsTotal: 0,
                boundaryFlag: false,
                isLegalDelivery: true,
                createsFreeHit: false,
                isFreeHit: false,
                wicketFlag: false,
                creditedBowlerFlag: true,
                recordedAt: '2026-09-10T18:00:00Z',
                updatedAt: '2026-09-10T18:00:00Z',
                versionNo: 1
            },
            {
                id: 'b2',
                inningsId: 'inn1',
                overId: 'o1',
                overNumber: 0,
                ballInOver: 2,
                ballSequenceGlobal: 2,
                strikerPersonId: 'p_striker',
                nonStrikerPersonId: 'p_non_striker',
                bowlerPersonId: 'p_bowler',
                battingTeamId: 'teamA',
                bowlingTeamId: 'teamB',
                outcomeType: 'Runs',
                runsBat: 4,
                runsExtras: 0,
                runsTotal: 4,
                boundaryFlag: true,
                isLegalDelivery: true,
                createsFreeHit: false,
                isFreeHit: false,
                wicketFlag: false,
                creditedBowlerFlag: true,
                recordedAt: '2026-09-10T18:00:10Z',
                updatedAt: '2026-09-10T18:00:10Z',
                versionNo: 1
            }
        ];

        const result = replayInningsEvents(events, { inningsNumber: 1, battingTeamId: 'teamA', bowlingTeamId: 'teamB' });

        expect(result.runs).toBe(4);
        expect(result.wickets).toBe(0);
        expect(result.oversDisplay).toBe('0.2');
        expect(result.legalBallsCount).toBe(2);

        const striker = result.batsmen.find(b => b.playerId === 'p_striker');
        expect(striker).toBeDefined();
        expect(striker?.runs).toBe(4);
        expect(striker?.ballsFaced).toBe(2);
        expect(striker?.fours).toBe(1);

        const bowler = result.bowlers.find(b => b.playerId === 'p_bowler');
        expect(bowler).toBeDefined();
        expect(bowler?.runsConceded).toBe(4);
        expect(bowler?.ballsBowled).toBe(2);
    });

    it('correctly handles extras and wickets', () => {
        const events: BallEvent[] = [
            {
                id: 'b1',
                inningsId: 'inn1',
                overId: 'o1',
                overNumber: 0,
                ballInOver: 1,
                ballSequenceGlobal: 1,
                strikerPersonId: 'p1',
                nonStrikerPersonId: 'p2',
                bowlerPersonId: 'p_bowler',
                battingTeamId: 'teamA',
                bowlingTeamId: 'teamB',
                outcomeType: 'Extra',
                extraType: 'Wide',
                runsBat: 0,
                runsExtras: 1,
                runsTotal: 1,
                boundaryFlag: false,
                isLegalDelivery: false,
                createsFreeHit: false,
                isFreeHit: false,
                wicketFlag: false,
                creditedBowlerFlag: true,
                recordedAt: '2026-09-10T18:00:00Z',
                updatedAt: '2026-09-10T18:00:00Z',
                versionNo: 1
            },
            {
                id: 'b2',
                inningsId: 'inn1',
                overId: 'o1',
                overNumber: 1,
                ballInOver: 1,
                ballSequenceGlobal: 2,
                strikerPersonId: 'p1',
                nonStrikerPersonId: 'p2',
                bowlerPersonId: 'p_bowler',
                battingTeamId: 'teamA',
                bowlingTeamId: 'teamB',
                outcomeType: 'Wicket',
                wicketType: 'Bowled',
                dismissedPersonId: 'p1',
                runsBat: 0,
                runsExtras: 0,
                runsTotal: 0,
                boundaryFlag: false,
                isLegalDelivery: true,
                createsFreeHit: false,
                isFreeHit: false,
                wicketFlag: true,
                creditedBowlerFlag: true,
                recordedAt: '2026-09-10T18:01:00Z',
                updatedAt: '2026-09-10T18:01:00Z',
                versionNo: 1
            }
        ];

        const result = replayInningsEvents(events);

        expect(result.runs).toBe(1);
        expect(result.wickets).toBe(1);
        expect(result.legalBallsCount).toBe(1); // Wide was not legal
        expect(result.extras.wides).toBe(1);
        expect(result.fallOfWickets.length).toBe(1);
        expect(result.fallOfWickets[0].wicketNumber).toBe(1);
        expect(result.fallOfWickets[0].batsmanOutId).toBe('p1');
    });
});
