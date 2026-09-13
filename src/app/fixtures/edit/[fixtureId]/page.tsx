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
import { D } from "@/lib/design-system";

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
    const fixtureDocRef = doc(db, 'matches', fixtureId);
    const docSnap = await getDoc(fixtureDocRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirestoreFixture;
    } else {
        return null;
    }
};

const updateFixture = async ({ fixtureId, updatedData }: { fixtureId: string, updatedData: Partial<FirestoreFixture> }) => {
    const fixtureDocRef = doc(db, 'matches', fixtureId);
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
        enabled: !!fixtureId,
    });

    const mutation = useMutation({
        mutationFn: updateFixture,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fixtures'] });
            toast({
                title: "FIXTURE UPDATED",
                description: "The match fixture details have been updated in institutional records.",
            });
            router.push('/fixtures');
        },
        onError: (err: Error) => {
            toast({
                title: "UPDATE FAILED",
                description: `Error updating fixture: ${err.message}`,
                variant: "destructive",
            });
        },
    });

    const [formData, setFormData] = React.useState<Partial<FirestoreFixture>>({});

    React.useEffect(() => {
        if (fixture) {
            setFormData({
                homeTeamId: fixture.homeTeamId,
                awayTeamId: fixture.awayTeamId,
                matchType: fixture.matchType,
                venueId: fixture.venueId,
                time: fixture.time,
                overs: fixture.overs,
                ageGroup: fixture.ageGroup,
                status: fixture.status,
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
            <div className="flex justify-center items-center h-64 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-xs font-mono font-semibold tracking-wider text-muted-foreground">LOADING MATCH DETAILS...</p>
            </div>
        );
    }

    if (isError || (!isLoading && !fixture)) {
        return (
            <Card className="max-w-xl mx-auto rounded-2xl border border-white/10" style={{ background: D.surf1 }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-400 text-base font-bold">
                        <AlertTriangle className="h-5 w-5" /> Fixture Record Not Found
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">The requested match fixture could not be retrieved from the database.</p>
                    <Button onClick={() => router.push('/fixtures')} variant="outline" className="text-xs rounded-xl border-white/10">
                        Back to Fixtures Repository
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            <Card className="rounded-2xl border shadow-2xl overflow-hidden" style={{ background: D.surf1, borderColor: D.border }}>
                <CardHeader className="border-b p-6" style={{ background: D.surf2, borderColor: D.border }}>
                    <CardTitle className="text-xl font-bold text-primary tracking-tight">Edit Match Fixture</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">Modify scheduling, venue, or status parameters for this fixture.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="homeTeamId" className="text-xs font-bold text-muted-foreground uppercase">Home Team</Label>
                                <Input id="homeTeamId" name="homeTeamId" value={formData.homeTeamId || ''} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                            <div>
                                <Label htmlFor="awayTeamId" className="text-xs font-bold text-muted-foreground uppercase">Away Team</Label>
                                <Input id="awayTeamId" name="awayTeamId" value={formData.awayTeamId || ''} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="matchType" className="text-xs font-bold text-muted-foreground uppercase">Match Format</Label>
                                <Input id="matchType" name="matchType" value={formData.matchType || ''} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                            <div>
                                <Label htmlFor="time" className="text-xs font-bold text-muted-foreground uppercase">Start Time</Label>
                                <Input id="time" name="time" type="time" value={formData.time || ''} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                            <div>
                                <Label htmlFor="overs" className="text-xs font-bold text-muted-foreground uppercase">Overs per Innings</Label>
                                <Input id="overs" name="overs" type="number" value={formData.overs || 20} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ageGroup" className="text-xs font-bold text-muted-foreground uppercase">Age Group / Division</Label>
                                <Input id="ageGroup" name="ageGroup" value={formData.ageGroup || ''} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                            <div>
                                <Label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase">Fixture Status</Label>
                                <Input id="status" name="status" value={formData.status || ''} onChange={handleInputChange} disabled={mutation.isPending} className="mt-1.5 h-10 text-xs rounded-xl border-white/10 bg-white/5" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                            <Button type="button" variant="outline" onClick={() => router.push('/fixtures')} className="h-10 px-5 rounded-xl text-xs font-semibold border-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="h-10 px-6 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Save Match Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}