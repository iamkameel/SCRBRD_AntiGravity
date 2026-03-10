import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, GraduationCap } from "lucide-react";
import { School } from "@/types/firestore";

interface SchoolCardProps {
  school: School;
  viewMode?: 'grid' | 'list';
}

export function SchoolCard({ school, viewMode = 'grid' }: SchoolCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {school.logoUrl ? (
              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50">
                <Image 
                  src={school.logoUrl} 
                  alt={school.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-lg font-bold text-primary">
                  {school.abbreviation?.[0] || school.name[0]}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{school.name}</h3>
              {school.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{school.location}</span>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-6 mr-4">
              {school.establishmentYear && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Est.</div>
                  <div className="font-medium text-sm">{school.establishmentYear}</div>
                </div>
              )}
            </div>
            <Link href={`/schools/${school.id}`}>
              <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground">View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-primary flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {school.logoUrl ? (
            <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border border-border/50 shadow-sm bg-muted">
              <Image 
                src={school.logoUrl} 
                alt={school.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
              <span className="text-2xl font-bold text-primary">
                {school.abbreviation?.[0] || school.name[0]}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors mb-1">
              {school.name}
            </h3>
            {school.abbreviation && (
              <Badge variant="secondary" className="font-normal text-xs">
                {school.abbreviation}
              </Badge>
            )}
          </div>
        </div>

        {/* Motto */}
        {school.motto && (
          <div className="mb-4 relative pl-3 border-l-2 border-primary/30 italic text-sm text-muted-foreground">
            &ldquo;{school.motto}&rdquo;
          </div>
        )}

        {/* Info Grid */}
        <div className="space-y-2 text-sm mt-auto mb-4">
          {school.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary/70" />
              <span className="truncate">{school.location}</span>
            </div>
          )}
          {school.establishmentYear && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0 text-primary/70" />
              <span>Est. {school.establishmentYear}</span>
            </div>
          )}
        </div>

        {/* School Colors */}
        {school.brandColors && (
          <div className="flex items-center gap-2 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Colors</span>
            <div className="flex gap-1 ml-auto">
              <div 
                className="h-5 w-5 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: school.brandColors.primary }}
                title="Primary Color"
              />
              <div 
                className="h-5 w-5 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: school.brandColors.secondary }}
                title="Secondary Color"
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-2">
          <Link href={`/schools/${school.id}`} className="block">
            <Button className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md shadow-primary/20">
              View School
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
