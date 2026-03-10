// Prematch page - placeholder for pre-match workflow
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound, Shuffle, ListOrdered } from "lucide-react";

export default function PrematchPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Prematch Processes</CardTitle>
          <CardDescription>Manage pre-match squad selections and team arrangements. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Prematch Process Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="team strategy" 
          />
          <p className="text-muted-foreground mb-6">
            This section will allow coaches and captains to pre-select match-day squads,
            auto-select teams based on performance, and arrange player order.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" disabled>
              <UsersRound className="mr-2 h-4 w-4" /> Select Squad
            </Button>
            <Button variant="outline" disabled>
              <Shuffle className="mr-2 h-4 w-4" /> Auto-Select Team
            </Button>
             <Button variant="outline" disabled>
              <ListOrdered className="mr-2 h-4 w-4" /> Arrange Players
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
