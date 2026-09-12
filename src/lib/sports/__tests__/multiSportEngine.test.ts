import { describe, it, expect } from "vitest";
import { formatSwimTime, calculateMultiSportChampionshipStandings } from "../multiSportEngine";

describe("Multi-Sport Engine (Swimming & Athletics)", () => {
    it("formats swimming times cleanly with sub-minute and minute splits", () => {
        expect(formatSwimTime(0)).toBe("NT");
        expect(formatSwimTime(24.85)).toBe("24.85");
        expect(formatSwimTime(65.4)).toBe("1:05.40");
        expect(formatSwimTime(125.05)).toBe("2:05.05");
    });

    it("calculates multi-sport championship standings across schools", () => {
        const results = [
            { schoolId: "sch-kes", points: 10 },
            { schoolId: "sch-st-johns", points: 8 },
            { schoolId: "sch-kes", points: 6 },
            { schoolId: "sch-[#00FF00]", points: 5 },
        ];

        const standings = calculateMultiSportChampionshipStandings(results);
        expect(standings["sch-kes"]).toBe(16);
        expect(standings["sch-st-johns"]).toBe(8);
    });
});
