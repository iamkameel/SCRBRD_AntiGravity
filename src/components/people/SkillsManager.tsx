"use client";

import { useState } from "react";
import { SkillsRadar } from "@/components/charts/SkillsRadar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Activity, Brain, Zap, Shield } from "lucide-react";
import { SkillMatrix } from "@/types/firestore";

interface SkillsManagerProps {
  initialSkills?: SkillMatrix;
  personId: string;
}

const SKILL_CATEGORIES = {
  technical: {
    label: "Technical Skills",
    icon: Activity,
    skills: [
      { key: "battingTechnique", label: "Batting Technique" },
      { key: "bowlingAccuracy", label: "Bowling Accuracy" },
      { key: "bowlingSpinControl", label: "Spin Control" },
      { key: "bowlingPace", label: "Pace / Speed" },
      { key: "fieldingCatching", label: "Catching" },
      { key: "fieldingThrowing", label: "Throwing" },
    ] as const,
  },
  tactical: {
    label: "Tactical Awareness",
    icon: Brain,
    skills: [
      { key: "tacticalAwareness", label: "Game Sense" },
      { key: "leadership", label: "Leadership" },
      { key: "teamwork", label: "Teamwork" },
      { key: "battingTemperament", label: "Temperament" },
    ] as const,
  },
  physical: {
    label: "Physical & Mental",
    icon: Zap,
    skills: [
      { key: "fitnessEndurance", label: "Endurance" },
      { key: "fitnessStrength", label: "Strength & Power" },
      { key: "fitnessAgility", label: "Agility" },
      { key: "fieldingAgility", label: "Fielding Agility" },
      { key: "battingPower", label: "Power Hitting" },
    ] as const,
  },
};

export function SkillsManager({ initialSkills, personId }: SkillsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<SkillMatrix>(initialSkills || {});
  const [tempSkills, setTempSkills] = useState<SkillMatrix>(initialSkills || {});

  const handleEdit = () => {
    setTempSkills({ ...skills });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setSkills({ ...tempSkills });
    setIsEditing(false);
    // In a real app, we would make an API call here to save the data
    console.log(`Saving skills for person ${personId}:`, tempSkills);
  };

  const handleSkillChange = (skill: keyof SkillMatrix, value: number) => {
    setTempSkills(prev => ({
      ...prev,
      [skill]: value
    }));
  };

  const getRatingColor = (rating: number = 0) => {
    if (rating >= 90) return "bg-purple-500";
    if (rating >= 75) return "bg-green-500";
    if (rating >= 60) return "bg-emerald-500";
    if (rating >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRatingLabel = (rating: number = 0) => {
    if (rating >= 90) return "Elite";
    if (rating >= 75) return "Excellent";
    if (rating >= 60) return "Good";
    if (rating >= 40) return "Average";
    return "Developing";
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Player Skills Matrix
          </h3>
          <p className="text-sm text-muted-foreground">Comprehensive skill assessment</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit Skills
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {category.skills.map((skillItem) => {
                const value = (isEditing ? tempSkills : skills)[skillItem.key as keyof SkillMatrix] || 0;
                
                return (
                  <div key={skillItem.key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">{skillItem.label}</label>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getRatingColor(value)}`}>
                          {getRatingLabel(value)}
                        </span>
                        <span className="text-sm font-bold w-8 text-right">{value}</span>
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <Slider
                        value={[value]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(vals) => handleSkillChange(skillItem.key as keyof SkillMatrix, vals[0])}
                        className="py-2"
                      />
                    ) : (
                      <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getRatingColor(value)} transition-all duration-500`} 
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {!isEditing && (
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-sm font-medium mb-4 text-muted-foreground">Overall Analysis</h4>
          <div className="h-[300px] w-full">
            {/* 
              NOTE: Update SkillsRadar to accept SkillMatrix or transform data here.
              For now, we'll hide it or pass a simplified version if needed, 
              but the requirement was to focus on the sliders/matrix UI.
              We can re-enable this once the Radar component is updated to handle the new data structure.
            */}
            <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/5 rounded-lg border border-dashed">
              <p>Radar Chart Visualization (Coming Soon)</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
