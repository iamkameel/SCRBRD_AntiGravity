// Wagon Wheel page - placeholder for interactive scoring tool
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Target } from "lucide-react";

export default function WagonWheelPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-[hsl(var(--primary))]" /> Wagon Wheel Scoring Tool
          </CardTitle>
          <CardDescription>Visualize player shot patterns with our interactive scoring tool. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Wagon Wheel Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="cricket field"
          />
          <p className="text-muted-foreground">
            This tool will feature live match scoring, instant visualization, an interactive field interface,
            and immediate data capture for detailed shot analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
