import { describe, it, expect } from 'vitest';
import {
    computeTurfHealth, detectBookingConflicts, findUnbookedFixtures, buildPrepSchedule,
    recommendPitchAllocation, weekOf, addDays, daysBetween, overlapMinutes, bookingsLast7Days,
    type UnifiedBooking, type FixtureSlot, type TurfHealth,
} from './turfEngine';
import type { GroundStatusLog, MaintenanceTask } from '@/types/schema_v4';

const TODAY = '2026-09-12'; // Saturday

const log = (over: Partial<GroundStatusLog> = {}): GroundStatusLog => ({
    id: 'l1', fieldId: 'f1', conditionStatus: 'Good', pitchReadiness: 90, outfieldReadiness: 85, equipmentReadiness: 90,
    moistureLevel: 16, grassCover: 92, loggedByPersonId: 'gk', loggedAt: `${TODAY}T06:30:00Z`, ...over,
});

const bk = (over: Partial<UnifiedBooking> = {}): UnifiedBooking => ({
    id: `b-${Math.random()}`, fieldId: 'f1', date: TODAY, startTime: '09:00', endTime: '13:00',
    title: 'Booking', type: 'Practice', status: 'Confirmed', source: 'field', ...over,
});

describe('date helpers', () => {
    it('weekOf starts on Monday', () => {
        expect(weekOf(TODAY)).toEqual(['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']);
    });
    it('addDays / daysBetween cross month boundaries', () => {
        expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
        expect(daysBetween('2026-09-30', '2026-10-02')).toBe(2);
    });
    it('overlapMinutes', () => {
        expect(overlapMinutes('09:00', '12:00', '11:00', '14:00')).toBe(60);
        expect(overlapMinutes('09:00', '12:00', '12:00', '14:00')).toBe(0);
    });
});

describe('computeTurfHealth', () => {
    it('scores a fresh, good log highly', () => {
        const h = computeTurfHealth({ id: 'f1', name: 'Main' }, [log()], 1, TODAY);
        expect(h.score).toBeGreaterThanOrEqual(85);
        expect(['A', 'B']).toContain(h.grade);
        expect(h.risks).toEqual([]);
    });
    it('penalises a missing log and flags it', () => {
        const h = computeTurfHealth({ id: 'f1', name: 'Main' }, [], 0, TODAY);
        expect(h.latestLog).toBeNull();
        expect(h.risks[0]).toMatch(/No ground status log/);
        expect(h.score).toBeLessThan(75);
    });
    it('flags stale inspections and over-use', () => {
        const h = computeTurfHealth({ id: 'f1', name: 'Main' }, [log({ loggedAt: '2026-09-01T06:00:00Z' })], 5, TODAY);
        expect(h.daysSinceLog).toBe(11);
        expect(h.risks).toContain('Inspection overdue');
        expect(h.risks).toContain('Over-used this week — schedule rest');
    });
    it('unplayable is grade F', () => {
        const h = computeTurfHealth({ id: 'f1', name: 'Main' }, [log({ conditionStatus: 'Unplayable', pitchReadiness: 10, outfieldReadiness: 20 })], 0, TODAY);
        expect(h.grade).toBe('F');
    });
});

describe('detectBookingConflicts', () => {
    it('finds an overlap on the same field and day, ignoring cancelled', () => {
        const a = bk({ startTime: '09:00', endTime: '12:00' });
        const b = bk({ startTime: '11:00', endTime: '14:00' });
        const c = bk({ startTime: '11:30', endTime: '13:00', status: 'Cancelled' });
        const conflicts = detectBookingConflicts([a, b, c]);
        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].overlapMinutes).toBe(60);
        expect(conflicts[0].kind).toBe('OVERLAP');
        expect(conflicts[0].severity).toBe('MEDIUM');
    });
    it('classifies maintenance-during-match and double-match as HIGH', () => {
        const m = bk({ type: 'Match', startTime: '09:00', endTime: '16:00' });
        const maint = bk({ type: 'Maintenance', startTime: '14:00', endTime: '17:00' });
        const m2 = bk({ type: 'Match', startTime: '13:00', endTime: '18:00' });
        const kinds = detectBookingConflicts([m, maint, m2]).map(c => c.kind).sort();
        // m×maint and maint×m2 are both maintenance-during-match; m×m2 is a double match
        expect(kinds).toEqual(['DOUBLE_MATCH', 'MAINTENANCE_DURING_MATCH', 'MAINTENANCE_DURING_MATCH']);
    });
    it('different fields never conflict', () => {
        expect(detectBookingConflicts([bk({ fieldId: 'f1' }), bk({ fieldId: 'f2' })])).toEqual([]);
    });
});

describe('findUnbookedFixtures', () => {
    const fx: FixtureSlot = { matchId: 'm1', fieldId: 'f1', date: TODAY, startTime: '09:00', endTime: '16:00', title: '1st XI v KES' };
    it('reports a fixture with no covering Match booking', () => {
        expect(findUnbookedFixtures([fx], [bk({ type: 'Practice' })])).toHaveLength(1);
    });
    it('is satisfied by a fixtureId link or an overlapping Match booking', () => {
        expect(findUnbookedFixtures([fx], [bk({ type: 'Event', fixtureId: 'm1' })])).toHaveLength(0);
        expect(findUnbookedFixtures([fx], [bk({ type: 'Match', startTime: '08:30', endTime: '17:00' })])).toHaveLength(0);
    });
    it('ignores fixtures without a field', () => {
        expect(findUnbookedFixtures([{ ...fx, fieldId: null }], [])).toHaveLength(0);
    });
});

describe('buildPrepSchedule', () => {
    const fx: FixtureSlot = { matchId: 'm1', fieldId: 'f1', date: addDays(TODAY, 2), startTime: '09:00', endTime: '16:00', title: 'Derby' };
    it('derives due dates from the fixture and statuses from today', () => {
        const s = buildPrepSchedule(fx, { id: 'f1', pitchType: 'Natural Turf' }, [], TODAY);
        expect(s.tasks).toHaveLength(7);
        const roll = s.tasks.find(t => t.key === 'roll')!;
        expect(roll.dueDate).toBe(addDays(TODAY, -1));
        expect(roll.status).toBe('OVERDUE');
        expect(s.tasks.find(t => t.key === 'mow-2')!.status).toBe('DUE_TODAY');
        expect(s.tasks.find(t => t.key === 'covers')!.status).toBe('UPCOMING');
        expect(s.overdueCount).toBeGreaterThan(0);
    });
    it('marks a task done when a matching completed maintenance task exists in its window', () => {
        const done: MaintenanceTask = { id: 't', fieldId: 'f1', title: 'Rolled', taskType: 'Rolling', priority: 'High', dueDate: addDays(TODAY, -1), status: 'COMPLETED', completedAt: `${addDays(TODAY, -1)}T10:00:00Z`, createdAt: '', updatedAt: '' };
        const s = buildPrepSchedule(fx, { id: 'f1', pitchType: 'Natural Turf' }, [done], TODAY);
        expect(s.tasks.find(t => t.key === 'roll')!.status).toBe('DONE');
    });
    it('synthetic surfaces only need marking and set-up', () => {
        const s = buildPrepSchedule(fx, { id: 'f1', pitchType: 'Artificial Astro-Turf' }, [], TODAY);
        expect(s.tasks.map(t => t.key)).toEqual(['mark', 'covers']);
    });
});

describe('recommendPitchAllocation', () => {
    const fields = [
        { id: 'main', name: 'Main Oval', fieldSize: 'Full Size' as const, floodlights: true },
        { id: 'b', name: 'B Oval', fieldSize: 'Full Size' as const, floodlights: false },
        { id: 'nets', name: 'Nets', fieldSize: 'Training Area' as const, floodlights: false },
    ];
    const health: Record<string, TurfHealth> = {
        main: computeTurfHealth({ id: 'main', name: 'Main' }, [log({ fieldId: 'main' })], 1, TODAY),
        b: computeTurfHealth({ id: 'b', name: 'B' }, [log({ fieldId: 'b', conditionStatus: 'Fair', pitchReadiness: 70 })], 1, TODAY),
        nets: computeTurfHealth({ id: 'nets', name: 'Nets' }, [log({ fieldId: 'nets' })], 0, TODAY),
    };
    const fx = (id: string, date: string, end = '16:00'): FixtureSlot => ({ matchId: id, fieldId: null, date, startTime: '09:00', endTime: end, title: id });

    it('prefers the healthiest free full-size field', () => {
        const [r] = recommendPitchAllocation([fx('m1', TODAY)], fields, health, []);
        expect(r.recommendedFieldId).toBe('main');
    });
    it('routes around an existing booking', () => {
        const [r] = recommendPitchAllocation([fx('m1', TODAY)], fields, health, [bk({ fieldId: 'main', type: 'Event', startTime: '10:00', endTime: '12:00' })]);
        expect(r.recommendedFieldId).toBe('b');
        expect(r.alternatives.find(a => a.fieldId === 'main')?.reason).toMatch(/Already booked/);
    });
    it('spreads load: same-day fixtures go to different fields and the weekly cap holds', () => {
        const recs = recommendPitchAllocation([fx('m1', TODAY), fx('m2', TODAY), fx('m3', TODAY)], fields, health, []);
        expect(recs[0].recommendedFieldId).toBe('main');
        expect(recs[1].recommendedFieldId).toBe('b');
        expect(recs[2].recommendedFieldId).toBe('nets'); // last resort, penalised but free
        const capped = recommendPitchAllocation(
            ['09-07', '09-08', '09-09', '09-10'].map((d, i) => fx(`w${i}`, `2026-${d}`)),
            [fields[0]], health, []
        );
        expect(capped.slice(0, 3).every(r => r.recommendedFieldId === 'main')).toBe(true);
        expect(capped[3].recommendedFieldId).toBeNull();
    });
    it('avoids a field with no floodlights for a late finish', () => {
        const [r] = recommendPitchAllocation([fx('m1', TODAY, '19:30')], fields, { ...health, main: health.b, b: health.main }, []);
        // b is now healthier but has no lights; main should still win because of the 25pt penalty
        expect(r.recommendedFieldId).toBe('main');
    });
});

describe('bookingsLast7Days', () => {
    it('counts the trailing week only', () => {
        const list = [bk({ date: TODAY }), bk({ date: addDays(TODAY, -6) }), bk({ date: addDays(TODAY, -7) }), bk({ date: addDays(TODAY, 1) })];
        expect(bookingsLast7Days(list, 'f1', TODAY)).toBe(2);
    });
});
