// Scoring Zones page - placeholder for zone analytics
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

export default function ScoringZonesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-[hsl(var(--primary))]" /> Scoring Zones Analytics
          </CardTitle>
          <CardDescription>Granular analytics and strategic insights through zone-based scoring. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
           <Image 
            src="https://placehold.co/600x400.png" 
            alt="Scoring Zones Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="data analytics"
          />
          <p className="text-muted-foreground">
            Analyze scoring patterns with zone categorization, heatmap generation, and comparative analytics
            to identify player tendencies, strengths, and weaknesses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
