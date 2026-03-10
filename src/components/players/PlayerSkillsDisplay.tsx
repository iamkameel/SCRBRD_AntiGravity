"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Player as Person } from "@/lib/store";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

interface PlayerSkillsDisplayProps {
  player: Person;
}

// Mock skills data if not present on player object
const getSkillsData = (player: Person) => {
  // In a real app, these would come from player.skills
  // For now, we'll generate some based on role
  const isBowler = player.role === 'Bowler';
  const isBatsman = player.role === 'Batsman';
  const isAllRounder = player.role === 'All Rounder';

  return [
    { subject: 'Batting', A: isBatsman || isAllRounder ? 85 : 45, fullMark: 100 },
    { subject: 'Bowling', A: isBowler || isAllRounder ? 85 : 40, fullMark: 100 },
    { subject: 'Fielding', A: 75, fullMark: 100 },
    { subject: 'Fitness', A: 80, fullMark: 100 },
    { subject: 'Mental', A: 70, fullMark: 100 },
    { subject: 'Tactical', A: 65, fullMark: 100 },
  ];
};

export function PlayerSkillsDisplay({ player }: PlayerSkillsDisplayProps) {
  const skillsData = getSkillsData(player);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={player.firstName}
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skill Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {skillsData.map((skill) => (
            <div key={skill.subject} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{skill.subject}</span>
                <span className="text-muted-foreground">{skill.A}/100</span>
              </div>
              <Progress 
                value={skill.A} 
                className={`h-2 ${
                  skill.A >= 80 ? "[&>div]:bg-emerald-500" :
                  skill.A >= 60 ? "[&>div]:bg-blue-500" :
                  skill.A >= 40 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"
                }`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
