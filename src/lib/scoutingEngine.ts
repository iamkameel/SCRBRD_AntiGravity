import { Player as Person } from "@/lib/store";

export type ScoutingReport = {
  personId: string;
  generatedAt: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  potentialRating: number; // 1-100
  comparison: string;
  careerProjection: {
    projectedRuns?: number;
    projectedWickets?: number;
    peakAge: number;
    summary: string;
  };
};

function calculatePotential(person: Person): number {
  const skills = person.skills || { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0, leadership: 0, experience: 0 };
  const age = person.dateOfBirth ? new Date().getFullYear() - new Date(person.dateOfBirth as string).getFullYear() : 20;

  // Base potential from current skills (weighted)
  let baseSkillScore = 0;
  const activeRole = person.playingRole || 'Player';

  // Safely access skills with defaults
  const batting = skills.batting || 0;
  const bowling = skills.bowling || 0;
  const fielding = skills.fielding || 0;
  const fitness = skills.fitness || 0;
  const mental = skills.mental || 0;

  if (activeRole === 'Batsman') {
    baseSkillScore = (batting * 2 + mental * 1.5 + fitness) / 4.5;
  } else if (activeRole === 'Bowler') {
    baseSkillScore = (bowling * 2 + fitness * 1.5 + mental) / 4.5;
  } else {
    baseSkillScore = (batting + bowling + fielding + fitness + mental) / 5;
  }

  // Age factor: Younger players have more room to grow
  // Peak age assumed around 28
  let ageFactor = 0;
  if (age < 20) ageFactor = 1.3; // High growth potential
  else if (age < 24) ageFactor = 1.15;
  else if (age < 28) ageFactor = 1.05;
  else ageFactor = 0.95; // Declining potential

  // Physical attributes bonus
  let physicalBonus = 0;
  if (person.physicalAttributes) {
    if (activeRole === 'Bowler' && (person.physicalAttributes.height || 0) > 185) physicalBonus += 2; // Tall bowlers bonus
    if (fitness > 18) physicalBonus += 2;
  }

  let potential = (baseSkillScore * 5) * ageFactor + physicalBonus;
  return Math.min(99, Math.round(potential));
}

function generateCareerProjection(person: Person, potential: number): ScoutingReport['careerProjection'] {
  const age = person.dateOfBirth ? new Date().getFullYear() - new Date(person.dateOfBirth as string).getFullYear() : 20;
  const remainingYears = Math.max(0, 35 - age);
  const peakAge = 28;

  let summary = "";
  let projectedRuns = undefined;
  let projectedWickets = undefined;
  const activeRole = person.playingRole || 'Player';

  if (activeRole === 'Batsman' || activeRole === 'AllRounder') {
    const currentRuns = person.stats?.totalRuns || 0;
    const matches = person.stats?.matchesPlayed || 1;
    const runsPerMatch = currentRuns / matches;
    // Simple projection: assumes improvement until peak, then decline
    const growthFactor = potential > 80 ? 1.2 : 1.05;
    projectedRuns = Math.round(currentRuns + (runsPerMatch * 15 * remainingYears * growthFactor)); // Approx 15 matches/year
    summary += `Projected to score ${projectedRuns.toLocaleString()} career runs. `;
  }

  if (activeRole === 'Bowler' || activeRole === 'AllRounder') {
    const currentWickets = person.stats?.wicketsTaken || 0;
    const matches = person.stats?.matchesPlayed || 1;
    const wicketsPerMatch = currentWickets / matches;
    const growthFactor = potential > 80 ? 1.2 : 1.05;
    projectedWickets = Math.round(currentWickets + (wicketsPerMatch * 15 * remainingYears * growthFactor));
    summary += `Estimated to take ${projectedWickets} career wickets.`;
  }

  return {
    projectedRuns,
    projectedWickets,
    peakAge,
    summary: summary || "Steady career progression expected."
  };
}

export function generateScoutingReport(person: Person): ScoutingReport {
  const skills = person.skills || { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0 };
  const stats = person.stats || { matchesPlayed: 0 };
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const activeRole = person.playingRole || 'Player';

  // Safely access skills with defaults
  const batting = skills.batting || 0;
  const bowling = skills.bowling || 0;
  const fielding = skills.fielding || 0;
  const fitness = skills.fitness || 0;
  const mental = skills.mental || 0;

  // Analyze Skills based on Role
  if (activeRole === 'Batsman' || activeRole === 'AllRounder') {
    if (batting > 16) strengths.push("Elite Batting Technique");
    else if (batting < 10) weaknesses.push("Batting Consistency");
    if (stats.strikeRate && stats.strikeRate > 140) strengths.push("Explosive Power Hitter");
  }

  if (activeRole === 'Bowler' || activeRole === 'AllRounder') {
    if (bowling > 16) strengths.push("Strike Bowler Potential");
    else if (bowling < 10) weaknesses.push("Bowling Control");
    // @ts-ignore - economyRate might not be in stats type definition yet
    if (stats.economyRate && stats.economyRate < 6) strengths.push("Economical Bowler");
  }

  if (fielding > 16) strengths.push("World Class Fielder");
  if (fitness > 17) strengths.push("Superior Athleticism");
  if (mental > 18) strengths.push("Clutch Performer");

  // Generate Summary
  let summary = `${person.firstName} is a ${activeRole} with `;
  if (activeRole === 'Batsman') {
    summary += batting > 15 ? "excellent technique and timing." : "room for improvement in shot selection.";
  } else if (activeRole === 'Bowler') {
    summary += bowling > 15 ? "threatening pace and accuracy." : "a need to work on consistency.";
  } else {
    summary += "balanced skills across the board.";
  }

  const potentialRating = calculatePotential(person);
  const careerProjection = generateCareerProjection(person, potentialRating);

  return {
    personId: person.id,
    generatedAt: new Date().toISOString(),
    summary,
    strengths,
    weaknesses,
    potentialRating,
    comparison: generateComparison(person),
    careerProjection
  };
}

function generateComparison(person: Person): string {
  // Mock comparison logic - in a real app this would search a database of historical players
  const skills = person.skills || { batting: 0, bowling: 0 };
  const activeRole = person.playingRole || 'Player';
  const batting = skills.batting || 0;
  const bowling = skills.bowling || 0;

  if (activeRole === 'Batsman') {
    return batting > 15 ? "Similar to a young Kane Williamson" : "Reminiscent of a gritty middle-order bat";
  } else if (activeRole === 'Bowler') {
    return bowling > 15 ? "Similar to Dale Steyn" : "Comparable to a steady first-change bowler";
  }
  return "A unique all-round talent";
}

export function calculatePlayerSimilarity(p1: Person, p2: Person): number {
  if (!p1 || !p2) return 0;

  const s1 = p1.skills || { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0 };
  const s2 = p2.skills || { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0 };

  // Safely access skills with defaults
  const p1Batting = s1.batting || 0;
  const p1Bowling = s1.bowling || 0;
  const p1Fielding = s1.fielding || 0;
  const p1Fitness = s1.fitness || 0;
  const p1Mental = s1.mental || 0;

  const p2Batting = s2.batting || 0;
  const p2Bowling = s2.bowling || 0;
  const p2Fielding = s2.fielding || 0;
  const p2Fitness = s2.fitness || 0;
  const p2Mental = s2.mental || 0;

  // Weighted difference based on primary role of p1
  let diff = 0;
  const activeRole = p1.playingRole || 'Player';

  if (activeRole === 'Batsman') {
    diff = Math.abs(p1Batting - p2Batting) * 2 +
      Math.abs(p1Mental - p2Mental) * 1.5 +
      Math.abs(p1Fitness - p2Fitness);
    // Max diff approx: 20*2 + 20*1.5 + 20 = 90
    return Math.max(0, Math.round(100 - (diff / 90 * 100)));
  } else if (activeRole === 'Bowler') {
    diff = Math.abs(p1Bowling - p2Bowling) * 2 +
      Math.abs(p1Fitness - p2Fitness) * 1.5 +
      Math.abs(p1Mental - p2Mental);
    return Math.max(0, Math.round(100 - (diff / 90 * 100)));
  } else {
    diff = Math.abs(p1Batting - p2Batting) +
      Math.abs(p1Bowling - p2Bowling) +
      Math.abs(p1Fielding - p2Fielding) +
      Math.abs(p1Fitness - p2Fitness) +
      Math.abs(p1Mental - p2Mental);
    return Math.max(0, Math.round(100 - diff)); // Max diff 100
  }
}
