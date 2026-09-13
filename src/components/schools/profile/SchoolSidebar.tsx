import { School, NewsPost } from "@/types/firestore";
import { MapPin, Phone, Globe, Mail, ExternalLink, Shield } from "lucide-react";
import Image from "next/image";

interface SchoolSidebarProps {
  school: School;
  news: NewsPost[];
}

export function SchoolSidebar({ school, news }: SchoolSidebarProps) {
  const primaryColor = school.brandColors?.primary || '#1e3a5f';
  const secondaryColor = school.brandColors?.secondary || '#ffd700';

  return (
    <div className="space-y-6">
      {/* Contact & Location Info */}
      <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
        <h3 className="text-lg font-bold font-head text-foreground flex items-center gap-2 pb-2 border-b border-border/30">
          <Shield className="h-4 w-4 text-primary" />
          School Details
        </h3>
        
        <div className="space-y-3 text-sm">
          {school.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{school.location}</span>
            </div>
          )}
          {school.contactPhone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-sky-400 shrink-0" />
              <span className="text-muted-foreground font-mono text-xs">{school.contactPhone}</span>
            </div>
          )}
          {school.contactEmail && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-violet-400 shrink-0" />
              <a href={`mailto:${school.contactEmail}`} className="hover:underline text-primary text-xs truncate">
                {school.contactEmail}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Globe className="h-4 w-4 text-amber-400 shrink-0" />
            <a 
              href={school.websiteUrl || "/schools"} 
              target={school.websiteUrl ? "_blank" : "_self"}
              rel={school.websiteUrl ? "noopener noreferrer" : undefined}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Visit Portal <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Brand Colours Swatch */}
      <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
        <h3 className="text-lg font-bold font-head text-foreground pb-2 border-b border-border/30">
          School Colours
        </h3>
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <div 
              className="h-12 w-12 rounded-2xl shadow-lg border-2 border-white/20 transition-transform hover:scale-110" 
              style={{ backgroundColor: primaryColor }} 
            />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{primaryColor}</span>
            <span className="text-xs font-medium text-foreground">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div 
              className="h-12 w-12 rounded-2xl shadow-lg border-2 border-white/20 transition-transform hover:scale-110" 
              style={{ backgroundColor: secondaryColor }} 
            />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{secondaryColor}</span>
            <span className="text-xs font-medium text-foreground">Secondary</span>
          </div>
        </div>
      </div>

      {/* Recent News */}
      <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
        <h3 className="text-lg font-bold font-head text-foreground pb-2 border-b border-border/30">
          Recent Bulletins
        </h3>
        <div className="space-y-4">
          {news.length > 0 ? (
            news.map((post) => (
              <div key={post.id} className="group cursor-pointer space-y-2">
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-muted border border-border/40">
                  <Image 
                    src={post.imageUrl || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop"} 
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">No recent bulletins posted.</p>
          )}
        </div>
      </div>
    </div>
  );
}
