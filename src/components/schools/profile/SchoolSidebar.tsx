import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, NewsPost } from "@/types/firestore";
import { MapPin, Phone, Globe, Mail, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SchoolSidebarProps {
  school: School;
  news: NewsPost[];
}

export function SchoolSidebar({ school, news }: SchoolSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {school.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm">{school.location}</span>
            </div>
          )}
          {school.contactPhone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm">{school.contactPhone}</span>
            </div>
          )}
          {school.contactEmail && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
              <a href={`mailto:${school.contactEmail}`} className="text-sm hover:underline text-primary">
                {school.contactEmail}
              </a>
            </div>
          )}
          {/* Website - assuming it might be in school object or we add it */}
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
            <a href="#" className="text-sm hover:underline text-primary flex items-center gap-1">
              Visit Website <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">School Colours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {school.brandColors?.primary && (
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="h-12 w-12 rounded-full shadow-sm border" 
                  style={{ backgroundColor: school.brandColors.primary }} 
                />
                <span className="text-xs font-mono text-muted-foreground">{school.brandColors.primary}</span>
              </div>
            )}
            {school.brandColors?.secondary && (
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="h-12 w-12 rounded-full shadow-sm border" 
                  style={{ backgroundColor: school.brandColors.secondary }} 
                />
                <span className="text-xs font-mono text-muted-foreground">{school.brandColors.secondary}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent News */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent News</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {news.length > 0 ? (
            news.map((post) => (
              <div key={post.id} className="group cursor-pointer space-y-2">
                <div className="relative h-32 w-full rounded-md overflow-hidden bg-muted">
                  <Image 
                    src={post.imageUrl || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop"} 
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent news.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
