import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { School } from "@/types/firestore";
import { MapPin, Calendar, Award } from "lucide-react";

interface SchoolHeroProps {
  school: School;
}

export function SchoolHero({ school }: SchoolHeroProps) {
  const primaryColor = school.brandColors?.primary || '#1e3a5f';
  const secondaryColor = school.brandColors?.secondary || '#ffd700';

  return (
    <div className="relative h-[280px] md:h-[360px] w-full overflow-hidden rounded-b-3xl shadow-2xl border-b border-border/30">
      {/* Dynamic Background with Color Gradients */}
      <div 
        className="absolute inset-0 z-10 opacity-90"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}ee 0%, #060910 85%, ${secondaryColor}33 100%)`
        }}
      />
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />

      {/* Content Container */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-end pb-6 md:pb-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* School Badge / Logo */}
          <div 
            className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl p-2 shadow-2xl shrink-0 -mb-10 md:mb-0 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105"
            style={{ 
              backgroundColor: '#0f1621', 
              border: `3px solid ${secondaryColor}`
            }}
          >
            {school.logoUrl ? (
              <div className="relative w-full h-full">
                <Image 
                  src={school.logoUrl} 
                  alt={school.name} 
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <span className="text-3xl md:text-4xl font-extrabold font-head" style={{ color: secondaryColor }}>
                {school.abbreviation || school.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Text Info */}
          <div className="flex-1 text-white space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold font-head tracking-tight text-white drop-shadow-md">
                {school.name}
              </h1>
              {school.abbreviation && (
                <Badge 
                  className="text-sm px-3 py-1 font-mono font-bold rounded-full shadow-sm border"
                  style={{ 
                    backgroundColor: `${secondaryColor}25`, 
                    color: secondaryColor,
                    borderColor: `${secondaryColor}50`
                  }}
                >
                  {school.abbreviation}
                </Badge>
              )}
            </div>

            {school.motto && (
              <p className="text-base md:text-xl font-light italic text-white/90 font-serif">
                &quot;{school.motto}&quot;
              </p>
            )}

            <div className="flex items-center gap-4 text-xs md:text-sm text-white/70 pt-1 font-medium">
              {school.establishmentYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Est. {school.establishmentYear}
                </span>
              )}
              {school.establishmentYear && school.location && <span>•</span>}
              {school.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {school.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
