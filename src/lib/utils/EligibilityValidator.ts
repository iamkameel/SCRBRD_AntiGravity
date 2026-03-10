import { AgeDivision, DivisionType } from '@/types/schema_v4';

export interface EligibilityResult {
    isEligible: boolean;
    reason?: string;
}

/**
 * Validates a player's eligibility to play in a specific division based on SCRBRD rules:
 * 1. Age-group divisions (AGE_GROUP) have strict maximum age eligibility.
 * 2. Open Division (OPEN_DIVISION) has no age restriction.
 * 3. Younger players may be selected for Open Division.
 * 4. Over-age players are ineligible for lower age-group divisions.
 * 
 * @param playerAge The age of the player at the eligibility cutoff date.
 * @param division The division containing maxAge and divisionType.
 */
export function checkPlayerEligibility(
    playerAge: number,
    division: { divisionType?: string; maxAge?: number | null; name?: string }
): EligibilityResult {
    const isOpenDivision = division.divisionType === 'OPEN_DIVISION' ||
        division.name?.toLowerCase().includes('1st xi') ||
        division.name?.toLowerCase().includes('open');

    // Rule 2 & 3: Open division has no age restriction
    if (isOpenDivision) {
        return { isEligible: true, reason: 'Open Division has no age restrictions.' };
    }

    // Rule 1 & 4: Age-group divisions have strict maximum age. Over-age players are ineligible.
    if (division.maxAge != null) {
        if (playerAge <= division.maxAge) {
            return { isEligible: true };
        } else {
            return {
                isEligible: false,
                reason: `Player age (${playerAge}) exceeds the maximum allowed age (${division.maxAge}) for this division.`
            };
        }
    }

    // Fallback: Infer max age from division name (e.g. 'U15' -> 15)
    const match = division.name?.match(/U(\d{1,2})/i);
    if (match && match[1]) {
        const impliedMaxAge = parseInt(match[1], 10);
        if (playerAge <= impliedMaxAge) {
            return { isEligible: true };
        } else {
            return {
                isEligible: false,
                reason: `Player age (${playerAge}) exceeds the implied maximum allowed age (${impliedMaxAge}) for this division.`
            };
        }
    }

    // No age limit defined and not explicitly an open division.
    return { isEligible: true, reason: 'No strict age limits defined for this division.' };
}
