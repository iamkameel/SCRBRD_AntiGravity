import { describe, it, expect } from "vitest";
import { getDlsResourcePercentage, calculateDlsParScore, getLiveDlsState } from "../dlsEngine";

describe("DLS Engine Core Math", () => {
    it("returns correct resource percentage at start of innings", () => {
        expect(getDlsResourcePercentage(50, 0)).toBe(100.0);
        expect(getDlsResourcePercentage(20, 0)).toBe(56.6);
    });

    it("calculates 2nd innings DLS par score and target accurately", () => {
        const res = calculateDlsParScore({
            firstInningsRuns: 250,
            totalOversMatch: 50,
            currentOversTeam2: 25,
            wicketsLostTeam2: 2,
        });

        expect(res.targetRuns).toBe(251);
        expect(res.parScore).toBeGreaterThan(0);
        expect(res.revisedOversTeam2).toBe(50);
    });

    it("calculates live DLS differential (ahead / behind status)", () => {
        const liveStateAhead = getLiveDlsState(200, 110, 50, 25, 2);
        expect(liveStateAhead.isParScoreAhead).toBe(true);
        expect(liveStateAhead.statusText).toContain("ahead of DLS Par");

        const liveStateBehind = getLiveDlsState(200, 50, 50, 25, 6);
        expect(liveStateBehind.isParScoreAhead).toBe(false);
        expect(liveStateBehind.statusText).toContain("behind DLS Par");
    });
});
