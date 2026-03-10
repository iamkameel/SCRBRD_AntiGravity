import { checkPlayerEligibility } from './EligibilityValidator';
import { describe, it, expect } from 'vitest';

describe('Player Eligibility Validator', () => {

    it('should allow any age for an open division (OPEN_DIVISION)', () => {
        const division = { divisionType: 'OPEN_DIVISION', name: '1st XI' };

        expect(checkPlayerEligibility(16, division).isEligible).toBe(true);
        expect(checkPlayerEligibility(19, division).isEligible).toBe(true);
        expect(checkPlayerEligibility(25, division).isEligible).toBe(true);
    });

    it('should deny over-age players for strict AGE_GROUP divisions', () => {
        const division = { divisionType: 'AGE_GROUP', name: 'U16', maxAge: 16 };

        expect(checkPlayerEligibility(15, division).isEligible).toBe(true);
        expect(checkPlayerEligibility(16, division).isEligible).toBe(true);
        expect(checkPlayerEligibility(17, division).isEligible).toBe(false);
        expect(checkPlayerEligibility(18, division).isEligible).toBe(false);
    });

    it('should fall back to regex maxAge extraction if maxAge is not explicitly provided', () => {
        const division = { divisionType: 'AGE_GROUP', name: 'U15' };

        expect(checkPlayerEligibility(14, division).isEligible).toBe(true);
        expect(checkPlayerEligibility(15, division).isEligible).toBe(true);
        expect(checkPlayerEligibility(16, division).isEligible).toBe(false);
    });

    it('should default to eligible if it cannot determine open or maxAge', () => {
        const division = { divisionType: 'AGE_GROUP', name: 'Mystery Division' };

        expect(checkPlayerEligibility(22, division).isEligible).toBe(true);
    });
});
