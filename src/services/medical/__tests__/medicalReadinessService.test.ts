import { describe, it, expect } from 'vitest';
import { medicalReadinessService } from '../medicalReadinessService';
import { MedicalIncident } from '@/lib/services/medicalService';

describe('medicalReadinessService', () => {
    it('returns 100 score and Ready status when player has no active incidents', () => {
        const result = medicalReadinessService.calculatePlayerReadiness('p1', []);
        expect(result.score).toBe(100);
        expect(result.status).toBe('Ready');
        expect(result.restrictsHighIntensityDrills).toBe(false);
        expect(result.clearanceRequired).toBe(false);
    });

    it('flags Unavailable status and requires clearance for Critical incident', () => {
        const incidents: MedicalIncident[] = [
            {
                personId: 'p1',
                personName: 'John Doe',
                type: 'Hamstring Tear',
                severity: 'Critical',
                status: 'Rehab',
                description: 'Grade 3 tear',
                reportedBy: 'Physio',
                reportedAt: '2026-09-01T00:00:00Z'
            }
        ];

        const result = medicalReadinessService.calculatePlayerReadiness('p1', incidents);
        expect(result.score).toBe(0);
        expect(result.status).toBe('Unavailable');
        expect(result.restrictsHighIntensityDrills).toBe(true);
        expect(result.clearanceRequired).toBe(true);
    });

    it('filters out High intensity drills when player has restricted medical status', () => {
        const drills = [
            { name: 'Light Catching', intensity: 'Low' },
            { name: 'Pace Bowling Sprints', intensity: 'High' },
            { name: 'Technique Block', intensity: 'Medium' }
        ];

        const readiness = medicalReadinessService.calculatePlayerReadiness('p1', [
            {
                personId: 'p1',
                personName: 'John',
                type: 'Ankle Strain',
                severity: 'High',
                status: 'Treated',
                description: 'Sprain',
                reportedBy: 'Doctor',
                reportedAt: '2026-09-05T00:00:00Z'
            }
        ]);

        const filtered = medicalReadinessService.filterDrillsByMedicalStatus(drills, readiness);
        expect(filtered.length).toBe(2);
        expect(filtered.find(d => d.name === 'Pace Bowling Sprints')).toBeUndefined();
    });

    it('validates squad medical clearance correctly', () => {
        const r1 = medicalReadinessService.calculatePlayerReadiness('p1', []);
        const r2 = medicalReadinessService.calculatePlayerReadiness('p2', [
            {
                personId: 'p2',
                personName: 'Dave',
                type: 'Concussion',
                severity: 'Critical',
                status: 'Reported',
                description: 'Head hit',
                reportedBy: 'Umpire',
                reportedAt: '2026-09-09T00:00:00Z'
            }
        ]);

        const check = medicalReadinessService.validateSquadMedicalClearance(['p1', 'p2'], {
            p1: r1,
            p2: r2
        });

        expect(check.isFullyCleared).toBe(false);
        expect(check.unclearedPlayerIds).toContain('p2');
        expect(check.flaggedPlayers.length).toBe(1);
    });
});
