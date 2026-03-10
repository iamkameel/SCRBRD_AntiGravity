'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { Match, LiveScoreProjection } from '@/types/firestore';

interface ReviewConfirmStepProps {
    match: Match;
    liveScore: LiveScoreProjection;
    onConfirm: () => Promise<any>;
    onCancel: () => void;
    inningsNumber: number;
}

export function ReviewConfirmStep({
    match,
    liveScore,
    onConfirm,
    onCancel,
    inningsNumber
}: ReviewConfirmStepProps) {
    const [isConfirming, setIsConfirming] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleConfirm = async () => {
        setIsConfirming(true);
        setError(null);
        try {
            const result = await onConfirm();
            if (!result.success) {
                setError(result.error || 'Failed to confirm innings end');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsConfirming(false);
        }
    };

    const currentInnings = liveScore.currentInnings;

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-2xl mx-auto w-full">
            <Card className="w-full border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <CheckCircle2 className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Review Innings {inningsNumber} end</CardTitle>
                    <CardDescription className="text-lg">
                        Please review the final score before completing the innings.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/50 text-center">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Final Score</p>
                            <p className="text-4xl font-black text-primary">
                                {currentInnings.runs}/{currentInnings.wickets}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 text-center">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Overs</p>
                            <p className="text-4xl font-black text-primary">
                                {currentInnings.overs}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Pre-completion Checklist
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                All balls for the current over are recorded ({liveScore.currentOver?.length || 0} balls)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                All wickets and extras are accounted for
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                This action cannot be undone easily
                            </li>
                        </ul>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button 
                        variant="outline" 
                        onClick={onCancel}
                        disabled={isConfirming}
                        className="flex-1 h-12 text-lg font-semibold"
                    >
                        Go Back & Edit
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={isConfirming}
                        className="flex-1 h-12 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {isConfirming ? 'Processing...' : 'Confirm & Complete'}
                        {!isConfirming && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                </CardFooter>
            </Card>

            <p className="text-xs text-muted-foreground text-center">
                Once confirmed, the match will transition to {liveScore.inningsNumber === 1 ? 'Innings Break' : 'Match Complete'}.
            </p>
        </div>
    );
}
