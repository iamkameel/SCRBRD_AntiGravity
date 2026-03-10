"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radar as RadarIcon } from "lucide-react";
import { SkillsRadar } from "@/components/charts/SkillsRadar";
import { useState } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";

export default function SpiderChartPage() {
  const [mode, setMode] = useState<'batting' | 'bowling'>('batting');

  const battingData = [
    { subject: 'Power', A: 85, fullMark: 100 },
    { subject: 'Timing', A: 90, fullMark: 100 },
    { subject: 'Footwork', A: 75, fullMark: 100 },
    { subject: 'Shot Selection', A: 60, fullMark: 100 },
    { subject: 'Aggression', A: 80, fullMark: 100 },
    { subject: 'Defense', A: 70, fullMark: 100 },
  ];

  const bowlingData = [
    { subject: 'Speed', A: 88, fullMark: 100 },
    { subject: 'Accuracy', A: 75, fullMark: 100 },
    { subject: 'Swing', A: 92, fullMark: 100 },
    { subject: 'Variations', A: 65, fullMark: 100 },
    { subject: 'Stamina', A: 85, fullMark: 100 },
    { subject: 'Control', A: 80, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
          <p className="text-muted-foreground">Detailed breakdown of player capabilities.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'batting' ? 'default' : 'outline'}
            onClick={() => setMode('batting')}
          >
            Batting
          </Button>
          <Button
            variant={mode === 'bowling' ? 'default' : 'outline'}
            onClick={() => setMode('bowling')}
          >
            Bowling
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <RadarIcon className="h-6 w-6 text-primary" />
              {mode === 'batting' ? 'Batting Analysis' : 'Bowling Analysis'}
            </CardTitle>
            <CardDescription>
              {mode === 'batting'
                ? 'Visualize power, precision, and technique.'
                : 'Visualize speed, accuracy, and variations.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="w-full h-full animate-fade-in">
              <SkillsRadar
                data={mode === 'batting' ? battingData : bowlingData}
                dataKeys={['A']}
                colors={['hsl(var(--primary))']}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>AI-generated performance feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'batting' ? (
              <>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                    Excellent Timing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Consistently finding the middle of the bat with a score of 90/100.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                    Shot Selection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Room for improvement in choosing the right shot for the delivery (60/100).
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                    Elite Swing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Exceptional ability to move the ball in the air (92/100).
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    Good Speed
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Generating good pace consistently (88/100).
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
