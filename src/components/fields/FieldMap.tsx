"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldMapProps {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export function FieldMap({ location, coordinates, address }: FieldMapProps) {
  // Generate Google Maps URL
  const getMapUrl = () => {
    if (coordinates) {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  // Generate embedded map using API Key if present, falling back to seamless iframe embed
  const getEmbedUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      if (coordinates) {
        return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${coordinates.lat},${coordinates.lng}&zoom=16`;
      }
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}`;
    }
    // High-fidelity fallback iframe without key requirement
    if (coordinates) {
      return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=16&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`;
  };

  const getDirectionsUrl = () => {
    if (coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(getDirectionsUrl(), '_blank')}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(getMapUrl(), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Maps
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Interactive Map */}
        <div className="relative w-full h-[400px] bg-muted">
          {coordinates ? (
            <iframe
              src={getEmbedUrl()}
              width="100%"
              height="100%"
              style={ { border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          ) : (
            // Fallback if no coordinates
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Interactive map view
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {location}
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open(getMapUrl(), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Google Maps
              </Button>
            </div>
          )}
        </div>

        {/* Address Details */}
        {address && (
          <div className="p-4 bg-muted/50 border-t">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">{location}</p>
                <p className="text-muted-foreground mt-1">{address}</p>
                {coordinates && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
