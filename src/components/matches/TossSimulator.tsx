"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Trophy } from "lucide-react";

interface TossSimulatorProps {
  homeTeamName: string;
  awayTeamName: string;
  onComplete: (result: {
    winner: 'home' | 'away';
    decision: 'bat' | 'field';
  }) => void;
  isReadOnly?: boolean;
  existingResult?: {
    winner: 'home' | 'away';
    decision: 'bat' | 'field';
  };
}

export function TossSimulator({
  homeTeamName,
  awayTeamName,
  onComplete,
  isReadOnly = false,
  existingResult
}: TossSimulatorProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [step, setStep] = useState<'flip' | 'decision' | 'complete'>(
    existingResult ? 'complete' : 'flip'
  );
  const [winner, setWinner] = useState<'home' | 'away' | null>(
    existingResult?.winner || null
  );
  const [decision, setDecision] = useState<'bat' | 'field' | null>(
    existingResult?.decision || null
  );

  const handleFlip = () => {
    if (isReadOnly) return;
    setIsFlipping(true);
    
    // Simulate flip animation
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'home' : 'away';
      setWinner(result);
      setIsFlipping(false);
      setStep('decision');
    }, 2000);
  };

  const handleDecision = (choice: 'bat' | 'field') => {
    if (isReadOnly || !winner) return;
    setDecision(choice);
    setStep('complete');
    onComplete({ winner, decision: choice });
  };

  if (step === 'complete' && winner && decision) {
    return (
      <Card className="p-6 text-center bg-muted/30 border-2 border-primary/20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Toss Result</h3>
            <p className="text-lg">
              <span className="font-semibold text-primary">
                {winner === 'home' ? homeTeamName : awayTeamName}
              </span>
              {' '}won the toss and elected to{' '}
              <span className="font-semibold text-primary">
                {decision === 'bat' ? 'BAT' : 'BOWL'}
              </span>
            </p>
          </div>
          {!isReadOnly && (
            <Button variant="ghost" size="sm" onClick={() => setStep('flip')} className="mt-2">
              Reset Toss
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coins className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold">Match Toss</h3>
        </div>

        {step === 'flip' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative h-32 w-32 mx-auto perspective-1000">
              <div
                className={`w-full h-full rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center shadow-xl transition-transform duration-[2000ms] ease-out ${
                  isFlipping ? "rotate-x-[1800deg]" : ""
                }`}
                style={{ 
                  transformStyle: "preserve-3d",
                  transform: isFlipping ? "rotateX(1800deg)" : "rotateX(0deg)"
                }}
              >
                <div className="text-4xl font-bold text-yellow-800">$</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Heads</p>
                <Badge variant="outline" className="text-lg py-1 px-4">
                  {homeTeamName}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Tails</p>
                <Badge variant="outline" className="text-lg py-1 px-4">
                  {awayTeamName}
                </Badge>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handleFlip} 
              disabled={isFlipping || isReadOnly}
              className="w-full max-w-xs"
            >
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </Button>
          </div>
        )}

        {step === 'decision' && winner && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-primary mb-1">
                {winner === 'home' ? homeTeamName : awayTeamName} Won!
              </h4>
              <p className="text-sm text-muted-foreground">
                What would they like to do?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleDecision('bat')}
              >
                <span className="text-2xl">🏏</span>
                <span className="font-bold">Bat First</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleDecision('field')}
              >
                <span className="text-2xl">🥎</span>
                <span className="font-bold">Bowl First</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
