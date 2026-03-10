"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";

interface TopPerformer {
  id: string;
  name: string;
  value: number;
  stat: string;
}

interface TopPerformersListProps {
  title: string;
  performers: TopPerformer[];
  icon?: React.ReactNode;
}


export function TopPerformersList({ title, performers, icon }: TopPerformersListProps) {
  if (performers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon || <Trophy className="h-4 w-4 text-amber-500" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {performers.map((performer, index) => (
            <Link
              key={performer.id}
              href={`/players/${performer.id}`}
              className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">
                  {performer.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {performer.value} {performer.stat}
              </span>
            </Link>
          ))}

        </div>
      </CardContent>
    </Card>
  );
}
