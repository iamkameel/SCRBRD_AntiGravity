// Live Scoring page - placeholder for real-time match scoring
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Tv } from "lucide-react";

export default function LiveScoringPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Tv className="h-6 w-6 text-[hsl(var(--primary))]" /> Live Match Scoring
          </CardTitle>
          <CardDescription>Real-time recording, tracking, and updating of match events. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Live Scoring Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="scoreboard stadium"
          />
          <p className="text-muted-foreground">
            A detailed and systematic approach to capturing all match activities, from runs scored
            and wickets fallen, to extras, overs completed, and other key game events, all in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
