import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { School } from "@/types/firestore";

interface SchoolHeroProps {
  school: School;
}

export function SchoolHero({ school }: SchoolHeroProps) {
  return (
    <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-b-3xl shadow-lg">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/75 z-10" />
      <div className="absolute inset-0 z-0">
         {/* Placeholder for school cover image if available, otherwise a generic pattern */}
         <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto h-full flex flex-col justify-end pb-8 md:pb-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* School Badge */}
          <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-xl bg-white p-2 shadow-xl -mb-12 md:mb-0 border-4 border-white">
            <div className="relative w-full h-full">
              <Image 
                src={school.logoUrl || "https://ui-avatars.com/api/?name=School&background=random"} 
                alt={school.name} 
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-white space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{school.name}</h1>
              {school.abbreviation && (
                <Badge variant="secondary" className="text-lg bg-white/20 hover:bg-white/30 text-white border-0">
                  {school.abbreviation}
                </Badge>
              )}
            </div>
            {school.motto && (
              <p className="text-xl md:text-2xl font-light italic opacity-90">
                &quot;{school.motto}&quot;
              </p>
            )}
            <div className="flex items-center gap-4 text-sm md:text-base opacity-80 pt-2">
              <span>Est. {school.establishmentYear}</span>
              <span>•</span>
              <span>{school.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
