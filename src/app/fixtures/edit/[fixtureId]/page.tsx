// Edit Fixture page
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Define an interface for the Firestore Fixture data
interface FirestoreFixture {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    matchType: 'T20' | 'ODI' | 'Test';
    venueId: string;
    scheduledDate: Timestamp | null;
    time: string;
    overs?: number;
    ageGroup: string;
    status: 'Scheduled' | 'Team Confirmed' | 'Ground Ready' | 'Live' | 'Completed' | 'Match Abandoned' | 'Rain-Delay' | 'Play Suspended';
    umpireIds: string[];
    scorerId: string | null;
    division?: string | null;
    leagueId?: string | null;
    provinceId?: string | null;
    createdAt?: Timestamp;
}

const fetchFixture = async (fixtureId: string | string[]): Promise<FirestoreFixture | null> => {
    if (typeof fixtureId !== 'string') {
        console.error("Invalid fixtureId provided:", fixtureId);
        return null;
    }
    const fixtureDocRef = doc(db, 'fixtures', fixtureId);
    const docSnap = await getDoc(fixtureDocRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirestoreFixture;
    } else {
        return null;
    }
};

const updateFixture = async ({ fixtureId, updatedData }: { fixtureId: string, updatedData: Partial<FirestoreFixture> }) => {
    const fixtureDocRef = doc(db, 'fixtures', fixtureId);
    await updateDoc(fixtureDocRef, updatedData);
};

export default function EditFixturePage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const fixtureId = params.fixtureId;

    const { data: fixture, isLoading, isError, error } = useQuery<FirestoreFixture | null, Error>({
        queryKey: ['fixture', fixtureId],
        queryFn: () => fetchFixture(fixtureId!),
        enabled: !!fixtureId, // Only run the query if fixtureId is available
    });

    const mutation = useMutation({
        mutationFn: updateFixture,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fixtures'] }); // Invalidate the list cache
            toast({
                title: "Fixture Updated",
                description: "The fixture has been successfully updated.",
            });
            router.push('/fixtures'); // Navigate back to the fixtures list
        },
        onError: (err: Error) => {
            toast({
                title: "Update Failed",
                description: `Error updating fixture: ${err.message}`,
                variant: "destructive",
            });
        },
    });

    // State for form data (initially empty, will be populated by fetched data)
    const [formData, setFormData] = React.useState<Partial<FirestoreFixture>>({});

    // Effect to populate form data once fixture is loaded
    React.useEffect(() => {
        if (fixture) {
            setFormData({
                homeTeamId: fixture.homeTeamId,
                awayTeamId: fixture.awayTeamId,
                matchType: fixture.matchType,
                venueId: fixture.venueId,
                // Note: Handling Timestamp for scheduledDate will require a date picker component
                // For now, we'll just display it or leave it out of the form state if not editable yet
                // scheduledDate: fixture.scheduledDate,
                time: fixture.time,
                overs: fixture.overs,
                ageGroup: fixture.ageGroup,
                status: fixture.status,
                // umpireIds: fixture.umpireIds, // Requires a multi-select or similar
                // scorerId: fixture.scorerId,   // Requires a select
                division: fixture.division,
                leagueId: fixture.leagueId,
                provinceId: fixture.provinceId,
            });
        }
    }, [fixture]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (fixtureId && typeof fixtureId === 'string') {
            mutation.mutate({ fixtureId, updatedData: formData });
        } else {
             toast({
                title: "Error",
                description: "Invalid fixture ID.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading fixture...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6" /> Error Loading Fixture
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive-foreground">There was a problem fetching the fixture data.</p>
                    <p className="text-xs text-muted-foreground mt-2">Details: {error?.message}</p>
                </CardContent>
            </Card>
        );
    }

    if (!fixture) {
        return (
             <Card className="border-orange-500">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-500"> 
                         <AlertTriangle className="h-6 w-6" /> Fixture Not Found
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The requested fixture could not be found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Edit Fixture</CardTitle>
                <CardDescription>Modify the details of this match fixture.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Input Fields (replace with more specific components later) */}
                    <div>
                        <Label htmlFor="homeTeamId">Home Team ID (Placeholder)</Label>
                        <Input id="homeTeamId" name="homeTeamId" value={formData.homeTeamId || ''} onChange={handleInputChange} disabled={mutation.isPending} />
                    </div>
                    <div>
                        <Label htmlFor="awayTeamId">Away Team ID (Placeholder)</Label>
                        <Input id="awayTeamId" name="awayTeamId" value={formData.awayTeamId || ''} onChange={handleInputChange} disabled={mutation.isPending} />
                    </div>
                     <div>
                        <Label htmlFor="matchType">Match Type (Placeholder)</Label>
                        <Input id="matchType" name="matchType" value={formData.matchType || ''} onChange={handleInputChange} disabled={mutation.isPending} />
                    </div>
                     <div>
                        <Label htmlFor="venueId">Venue ID (Placeholder)</Label>
                        <Input id="venueId" name="venueId" value={formData.venueId || ''} onChange={handleInputChange} disabled={mutation.isPending} />
                    </div>
                     <div>
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" name="time" type="time" value={formData.time || ''} onChange={handleInputChange} disabled={mutation.isPending} />
                    </div>
                     <div>
                        <Label htmlFor="ageGroup">Age Group</Label>
                        <Input id="ageGroup" name="ageGroup" value={formData.ageGroup || ''} onChange={handleInputChange} disabled={mutation.isPending} />
                    </div>
                     <div>
                        <Label htmlFor="status">Status</Label>
                        <Input id="status" name="status" value={formData.status || ''} onChange={handleInputChange} disabled={mutation.isPending} />
 </div>
                    {/* Add other fields as needed based on your FirestoreFixture interface */}

                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Fixture'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}