'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManhattanChart as ManhattanChartComponent, WormChart as WormChartComponent } from "@/components/charts/lazy";
import { WagonWheel as WagonWheelComponent } from "@/components/charts/WagonWheel";
import { PitchMap as PitchMapComponent } from "@/components/charts/PitchMap";

// Re-export base components
export const ManhattanChart = ManhattanChartComponent;
export const WormChart = WormChartComponent;
export const WagonWheel = WagonWheelComponent;
export const PitchMap = PitchMapComponent;

// Card wrapper components for use in match pages
export function WagonWheelCard({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wagon Wheel</CardTitle>
      </CardHeader>
      <CardContent>
        <WagonWheelComponent innings={data} />
      </CardContent>
    </Card>
  );
}

export function PitchMapCard({ data }: { data: any }) {
  // Extract deliveries from innings data
  const deliveries = data?.overHistory?.flatMap((over: any) => 
    over.balls
      .filter((ball: any) => ball.length && ball.line)
      .map((ball: any) => ({
        length: ball.length,
        line: ball.line,
        runs: ball.runs,
        isWicket: ball.isWicket
      }))
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pitch Map</CardTitle>
      </CardHeader>
      <CardContent>
        <PitchMapComponent deliveries={deliveries} />
      </CardContent>
    </Card>
  );
}

export function ManhattanChartCard({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manhattan - Runs Per Over</CardTitle>
      </CardHeader>
      <CardContent>
        <ManhattanChartComponent innings={data} />
      </CardContent>
    </Card>
  );
}

export function WormChartCard({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Worm - Cumulative Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <WormChartComponent innings1={data} team1Name="Team 1" team2Name="Team 2" />
      </CardContent>
    </Card>
  );
}

// Deprecated: keeping for backward compatibility
export const RunMapCard = PitchMapCard;
