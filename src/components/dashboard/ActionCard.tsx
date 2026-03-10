import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  variant?: "default" | "compact";
}

export function ActionCard({ 
  icon: Icon, 
  title, 
  description, 
  href,
  variant = "default" 
}: ActionCardProps) {
  return (
    <Link href={href}>
      <Card className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              </div>
            </div>
            {variant === "default" ? (
              <Button 
                size="icon" 
                className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
