import { describe, expect, it } from "vitest";
import {
  abilityRadarData,
  assessmentToAbilityVector,
  createAbilitySnapshot,
  deriveScoutGrade,
  type AssessmentMatrix,
} from "./talentIdentificationEngine";

const assessment: AssessmentMatrix = {
  technicalScore: 16,
  tacticalScore: 12,
  physicalScore: 10,
  mentalScore: 17,
  competitivenessScore: 8,
  statisticalEvidenceScore: 13,
};

describe("talentIdentificationEngine", () => {
  it("normalises the native assessment matrix into a six-domain ability profile", () => {
    expect(assessmentToAbilityVector(assessment)).toEqual({
      Technical: 80,
      Tactical: 80,
      Physical: 67,
      Mental: 85,
      Competitive: 80,
      Evidence: 65,
    });
  });

  it("keeps potential above current ability while capping every dimension at 100", () => {
    const snapshot = createAbilitySnapshot("2026", assessment, "A+", 15, "High-upside Athlete");

    expect(snapshot.projectedPotential).toBeGreaterThan(snapshot.currentAbility);
    expect(Object.values(snapshot.projectedAbilities).every((score) => score >= 0 && score <= 100)).toBe(true);
  });

  it("produces a chart-ready current versus potential radar for all six dimensions", () => {
    const snapshot = createAbilitySnapshot("2026", assessment, "A", 17, "Role Specialist");
    const radar = abilityRadarData(snapshot);

    expect(radar).toHaveLength(6);
    expect(radar[0]).toMatchObject({ subject: "Technical", Current: 80 });
    expect(radar.every((point) => point.Potential >= point.Current)).toBe(true);
  });

  it("derives a stable grade at the published boundaries", () => {
    expect(deriveScoutGrade(90)).toBe("A+");
    expect(deriveScoutGrade(80)).toBe("A");
    expect(deriveScoutGrade(70)).toBe("B+");
    expect(deriveScoutGrade(60)).toBe("B");
    expect(deriveScoutGrade(59)).toBe("C");
  });
});
