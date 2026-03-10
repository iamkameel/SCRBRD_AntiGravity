// Groundskeeper Detail page

"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchGroundskeeperById, type GroundskeeperProfile } from '@/lib/groundskeeper-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Briefcase, CheckCircle, MapPin, Sprout, Info, Loader2 } from "lucide-react";

const DetailItem: React.FC<{ label: string; value: string | number | undefined | React.ReactNode; icon?: React.ElementType; className?: string }> = ({ label, value, icon: Icon, className }) => (
  <div className={`flex items-start py-2 ${className || ''}`}>
    {Icon && <Icon className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {value !== undefined && value !== null ? (
        typeof value === 'string' || typeof value === 'number' ? (
          <p className="text-md text-foreground">{value}</p>
        ) : (
          <div className="text-md text-foreground">{value}</div>
        )
      ) : (
        <p className="text-md text-muted-foreground">N/A</p>
      )}
    </div>
  </div>
);

export default function GroundskeeperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groundskeeperId = params.groundskeeperId as string;

  const [groundskeeper, setGroundskeeper] = React.useState<GroundskeeperProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadGroundskeeper = async () => {
      try {
        const data = await fetchGroundskeeperById(groundskeeperId);
        setGroundskeeper(data);
      } catch (error) {
        console.error('Error loading groundskeeper:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGroundskeeper();
  }, [groundskeeperId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading groundskeeper details...</p>
      </div>
    );
  }

  if (!groundskeeper) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Groundskeeper Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn&apos;t find details for this groundskeeper.</p>
            <Button onClick={() => router.push('/groundskeeper-profiles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groundskeeper Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/groundskeeper-profiles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profiles
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader className="bg-muted/50 p-6 flex flex-col items-center text-center space-y-3 md:flex-row md:text-left md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-md">
            <AvatarImage src={groundskeeper.avatar} alt={groundskeeper.name} data-ai-hint="groundskeeper portrait" />
            <AvatarFallback className="text-3xl">{groundskeeper.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{groundskeeper.name}</CardTitle>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="default" className="text-sm px-3 py-1">{groundskeeper.experienceYears} Yrs Exp.</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {groundskeeper.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-[hsl(var(--primary))]" /> About {groundskeeper.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{groundskeeper.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" /> Assigned Fields
              </CardTitle>
              <CardDescription>Fields managed or maintained by {groundskeeper.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {groundskeeper.assignedFields.length > 0 ? (
                <div className="space-y-4">
                  {groundskeeper.assignedFields.map((field, index) => (
                    <Card key={index} className="bg-muted/30 p-4 shadow-sm">
                      <p className="font-semibold text-md">{field.fieldName}</p>
                      {field.location && <p className="text-sm text-muted-foreground">Location: {field.location}</p>}
                      {field.condition && (
                        <p className="text-xs text-primary mt-1">Condition: {field.condition}</p>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specific fields currently assigned or listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]" /> Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Experience" value={`${groundskeeper.experienceYears} years`} icon={CheckCircle} />
              <DetailItem
                label="Expertise Areas"
                icon={Sprout}
                value={
                  groundskeeper.expertiseAreas.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {groundskeeper.expertiseAreas.map((area, idx) => <li key={idx} className="text-sm">{area}</li>)}
                    </ul>
                  ) : (
                    "Not specified"
                  )
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[hsl(var(--primary))]" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Email Address" value={groundskeeper.email} icon={Mail} />
              <DetailItem label="Phone Number" value={groundskeeper.phone} icon={Phone} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
