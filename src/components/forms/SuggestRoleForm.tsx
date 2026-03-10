"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { suggestPlayerRole, type SuggestPlayerRoleInput, type SuggestPlayerRoleOutput } from "@/ai/flows/suggest-player-role";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  playerName: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  playerStatistics: z.string().min(10, { message: "Statistics must be at least 10 characters." }),
  playerSkills: z.string().min(10, { message: "Skills description must be at least 10 characters." }),
});

export function SuggestRoleForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestPlayerRoleOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      playerStatistics: "",
      playerSkills: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestPlayerRole(values as SuggestPlayerRoleInput);
      setSuggestion(result);
      toast({
        title: "Suggestion Ready!",
        description: "Player role suggestion has been generated.",
      });
    } catch (error) {
      console.error("Error suggesting player role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate player role suggestion. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[hsl(var(--accent))]" />
            Suggest Player Role (AI Powered)
          </CardTitle>
          <CardDescription>
            Enter player details to get an AI-powered suggestion for their most suitable playing role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Virat Kohli" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="playerStatistics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Statistics</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Runs: 12000, Avg: 55.0, Wickets: 50, Catches: 100"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="playerSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Skills & Strengths</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Excellent cover drive, good temperament, agile fielder, bowls off-spin"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Role
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {suggestion && (
        <Card className="mt-6 bg-secondary">
          <CardHeader>
            <CardTitle className="text-xl">AI Suggested Role for {form.getValues("playerName")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{suggestion.suggestedRole}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
