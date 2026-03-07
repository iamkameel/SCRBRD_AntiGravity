"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Trash2,
  RotateCcw,
  Database,
  AlertCircle,
  CheckCircle2,
  Terminal,
  ChevronRight,
  Sparkles,
  Zap,
  Settings,
  Loader2,
} from "lucide-react";
import {
  generateTestMatchAction,
  cleanupTestArenaAction,
  resetMatchAction,
} from "@/app/actions/testingArenaActions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function TestingArena() {
  const [loading, setLoading] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading("generate");
    const result = await generateTestMatchAction();
    setLoading(null);
    if (result.success) {
      setMatchId(result.matchId ?? null);
      toast({
        title: "Test Match Generated",
        description: "Created schools, teams, and a T20 match ready for scoring.",
      });
    } else {
      toast({
        title: "Generation Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleCleanup = async () => {
    setLoading("cleanup");
    const result = await cleanupTestArenaAction();
    setLoading(null);
    if (result.success) {
      setMatchId(null);
      toast({
        title: "Cleanup Complete",
        description: "All test arena data has been removed.",
      });
    }
  };

  const handleReset = async () => {
    if (!matchId) return;
    setLoading("reset");
    const result = await resetMatchAction(matchId);
    setLoading(null);
    if (result.success) {
      toast({
        title: "Match Reset",
        description: "Match status reverted to SCHEDULED and scores cleared.",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
            System Administration
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Testing Arena</h1>
          <p className="text-lg text-muted-foreground">
            Simulate matches and test scoring workflows with pre-populated data.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-3">
          <Terminal className="w-3 h-3" />
          SCRBRD v2.0.0
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scenarios Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
              Match Scenarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScenarioCard
              title="Classic Start"
              description="New match at 0-0. Perfect for testing pre-match setup and first delivery."
              icon={<Play className="w-5 h-5" />}
              matchId={matchId}
            />
            <ScenarioCard
              title="Mid-Innings"
              description="Pick up a match mid-over to test scoring flow, partnerships, and bowling changes."
              icon={<Sparkles className="w-5 h-5" />}
              matchId={matchId}
            />
          </div>

          {/* Scenario Library CTA */}
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-md transition-all border-dashed hover:border-primary/50 group">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Database className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold">Scenario Library</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Complex scenarios like Chase Mode and Tied Matches are arriving in v2.1.0.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Administration Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
              Administration
            </h2>
          </div>

          <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/5 shadow-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Environment Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="default"
                className="w-full justify-start h-11"
                onClick={handleGenerate}
                disabled={loading === "generate"}
              >
                {loading === "generate" ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Generate Test Data
                <Badge className="ml-auto bg-white/20 hover:bg-white/20 text-white border-none text-[10px]">
                  ALPHA / BETA
                </Badge>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-11 border-primary/20 hover:bg-primary/5"
                onClick={handleReset}
                disabled={loading === "reset" || !matchId}
              >
                {loading === "reset" ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2 text-primary" />
                )}
                Quick Reset
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleCleanup}
                disabled={loading === "cleanup"}
              >
                {loading === "cleanup" ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Cleanup Environment
              </Button>
            </CardContent>
            <CardFooter className="pt-2 bg-muted/20 border-t">
              <div className="text-[10px] text-muted-foreground leading-relaxed">
                <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                Generating test data creates{" "}
                <span className="text-foreground font-bold">30+ documents</span> in Firestore. Use
                cleanup to save quota.
              </div>
            </CardFooter>
          </Card>

          {/* Active Match Card */}
          {matchId && (
            <Card className="bg-primary/5 border-primary/20 animate-in zoom-in-95 duration-300">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Active Test Match</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {matchId}</p>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/matches/${matchId}/manage`}>
                    Manage Match <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Scenario Card ── */

function ScenarioCard({
  title,
  description,
  icon,
  matchId,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  matchId: string | null;
}) {
  const isAvailable = !!matchId;

  return (
    <Card
      className={`group relative overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-lg ${
        !isAvailable ? "opacity-60 grayscale" : ""
      }`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <CardHeader className="pb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <CardDescription className="text-balance leading-relaxed">{description}</CardDescription>
      </CardContent>
      <CardFooter className="pt-0 border-t bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 h-9 text-xs group-hover:text-primary"
          disabled={!isAvailable}
          asChild={isAvailable}
        >
          {isAvailable ? (
            <Link href={`/matches/${matchId}/manage`}>
              Switch Scenario <ChevronRight className="w-3 h-3 ml-2" />
            </Link>
          ) : (
            <span>Generate Data First</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
