/**
 * SCRBRD Medical Readiness Linkage Service
 * ========================================
 * Evaluates active medical incidents and calculates player readiness,
 * restricts high-intensity drill recommendations, and enforces squad selection warnings.
 */

import { MedicalIncident } from '@/lib/services/medicalService';

export interface MedicalReadinessResult {
    personId: string;
    score: number; // 0 - 100
    status: 'Ready' | 'Caution' | 'Restricted' | 'Unavailable';
    injuryModifier: number; // negative impact on total readiness
    activeIncidents: MedicalIncident[];
    restrictsHighIntensityDrills: boolean;
    clearanceRequired: boolean;
    medicalNotes: string[];
}

export interface SquadMedicalCheckResult {
    isFullyCleared: boolean;
    unclearedPlayerIds: string[];
    flaggedPlayers: Array<{
        personId: string;
        status: 'Caution' | 'Restricted' | 'Unavailable';
        reason: string;
    }>;
}

export const medicalReadinessService = {
    /**
     * Calculates the medical readiness score and status for a player based on active incidents.
     */
    calculatePlayerReadiness(personId: string, incidents: MedicalIncident[]): MedicalReadinessResult {
        const activeIncidents = incidents.filter(
            (inc) => inc.personId === personId && inc.status !== 'Cleared'
        );

        if (activeIncidents.length === 0) {
            return {
                personId,
                score: 100,
                status: 'Ready',
                injuryModifier: 0,
                activeIncidents: [],
                restrictsHighIntensityDrills: false,
                clearanceRequired: false,
                medicalNotes: ['No active medical restrictions recorded.']
            };
        }

        // Determine worst severity active incident
        let minScore = 100;
        let worstStatus: 'Caution' | 'Restricted' | 'Unavailable' = 'Caution';
        let worstModifier = 0;
        let restrictsHigh = false;
        let requiresClearance = false;
        const notes: string[] = [];

        activeIncidents.forEach((inc) => {
            notes.push(`[${inc.severity}] ${inc.type}: ${inc.description} (${inc.status})`);

            switch (inc.severity) {
                case 'Critical':
                    minScore = Math.min(minScore, 0);
                    worstStatus = 'Unavailable';
                    worstModifier = -100;
                    restrictsHigh = true;
                    requiresClearance = true;
                    break;
                case 'High':
                    minScore = Math.min(minScore, 25);
                    if (worstStatus !== 'Unavailable') worstStatus = 'Restricted';
                    worstModifier = Math.min(worstModifier, -75);
                    restrictsHigh = true;
                    requiresClearance = true;
                    break;
                case 'Medium':
                    minScore = Math.min(minScore, 60);
                    if (worstStatus === 'Caution') worstStatus = 'Caution';
                    worstModifier = Math.min(worstModifier, -40);
                    restrictsHigh = true;
                    break;
                case 'Low':
                    minScore = Math.min(minScore, 85);
                    worstModifier = Math.min(worstModifier, -15);
                    break;
            }
        });

        return {
            personId,
            score: minScore,
            status: worstStatus,
            injuryModifier: worstModifier,
            activeIncidents,
            restrictsHighIntensityDrills: restrictsHigh,
            clearanceRequired: requiresClearance,
            medicalNotes: notes
        };
    },

    /**
     * Filters training drills to ensure safety compliance with a player's medical readiness state.
     */
    filterDrillsByMedicalStatus<T extends { intensity?: string; name: string }>(
        drills: T[],
        readiness: MedicalReadinessResult
    ): T[] {
        if (!readiness.restrictsHighIntensityDrills) {
            return drills;
        }

        return drills.filter((drill) => {
            const intensity = (drill.intensity || '').toLowerCase();
            return intensity !== 'high' && intensity !== 'elite' && intensity !== 'maximum';
        });
    },

    /**
     * Evaluates a proposed match-day squad against medical clearance statuses.
     */
    validateSquadMedicalClearance(
        squadPlayerIds: string[],
        playerReadinessMap: Record<string, MedicalReadinessResult>
    ): SquadMedicalCheckResult {
        const flaggedPlayers: SquadMedicalCheckResult['flaggedPlayers'] = [];
        const unclearedPlayerIds: string[] = [];

        squadPlayerIds.forEach((pid) => {
            const readiness = playerReadinessMap[pid];
            if (readiness && readiness.status !== 'Ready') {
                if (readiness.clearanceRequired || readiness.status === 'Unavailable') {
                    unclearedPlayerIds.push(pid);
                }
                flaggedPlayers.push({
                    personId: pid,
                    status: readiness.status,
                    reason: readiness.medicalNotes.join(' | ')
                });
            }
        });

        return {
            isFullyCleared: unclearedPlayerIds.length === 0,
            unclearedPlayerIds,
            flaggedPlayers
        };
    }
};
