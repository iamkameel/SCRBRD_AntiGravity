"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createDocument, fetchTeams } from "@/lib/firestore";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleSeed = async () => {
    setLoading(true);
    setStatus("Seeding...");
    setLogs([]);

    try {
      // 1. Create Season
      addLog("Creating Season '2025'...");
      const seasonId = await createDocument("seasons", {
        name: "2025",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        active: true,
        createdAt: new Date().toISOString()
      });
      addLog(`Season created: ${seasonId}`);

      // 2. Create League
      addLog("Creating League 'KZN High Schools'...");
      const leagueId = await createDocument("leagues", {
        name: "KZN High Schools",
        provinceId: "KZN",
        type: "League",
        createdAt: new Date().toISOString()
      });
      addLog(`League created: ${leagueId}`);

      // 3. Create Divisions
      addLog("Creating Divisions...");
      const div1Id = await createDocument("divisions", {
        name: "1st XI Premier",
        leagueId: leagueId,
        ageGroup: "Open",
        season: "2025",
        createdAt: new Date().toISOString()
      });
      addLog(`Division '1st XI Premier' created: ${div1Id}`);

      const divU16Id = await createDocument("divisions", {
        name: "U16A",
        leagueId: leagueId,
        ageGroup: "U16",
        season: "2025",
        createdAt: new Date().toISOString()
      });
      addLog(`Division 'U16A' created: ${divU16Id}`);

      // 4. Create Schools
      const schoolsData = [
        { name: "Northwood School", abbreviation: "Northwood", brandColors: { primary: "#003366", secondary: "#FFFFFF" }, logoUrl: "https://placehold.co/200x200/003366/FFFFFF.png?text=NW" },
        { name: "Westville Boys' High", abbreviation: "WBHS", brandColors: { primary: "#000000", secondary: "#FF0000" }, logoUrl: "https://placehold.co/200x200/000000/FF0000.png?text=WBHS" },
        { name: "Glenwood High", abbreviation: "Glenwood", brandColors: { primary: "#008000", secondary: "#FFFF00" }, logoUrl: "https://placehold.co/200x200/008000/FFFF00.png?text=GHS" },
        { name: "Durban High School", abbreviation: "DHS", brandColors: { primary: "#000080", secondary: "#FFD700" }, logoUrl: "https://placehold.co/200x200/000080/FFD700.png?text=DHS" },
        { name: "Kearsney College", abbreviation: "Kearsney", brandColors: { primary: "#800000", secondary: "#FFFFFF" }, logoUrl: "https://placehold.co/200x200/800000/FFFFFF.png?text=KC" },
        { name: "Clifton School", abbreviation: "Clifton", brandColors: { primary: "#000000", secondary: "#FFFFFF" }, logoUrl: "https://placehold.co/200x200/000000/FFFFFF.png?text=CS" },
        { name: "Hilton College", abbreviation: "Hilton", brandColors: { primary: "#000000", secondary: "#FFFFFF" }, logoUrl: "https://placehold.co/200x200/000000/FFFFFF.png?text=HC" },
        { name: "Michaelhouse", abbreviation: "MHS", brandColors: { primary: "#FF0000", secondary: "#FFFFFF" }, logoUrl: "https://placehold.co/200x200/FF0000/FFFFFF.png?text=MHS" },
      ];

      addLog(`Creating ${schoolsData.length} Schools...`);
      
      for (const school of schoolsData) {
        const schoolId = await createDocument("schools", {
          ...school,
          provinceId: "KZN",
          createdAt: new Date().toISOString()
        });
        addLog(`School '${school.name}' created: ${schoolId}`);

        // 5. Create Teams for this School
        // 1st XI
        await createDocument("teams", {
          name: `${school.abbreviation} 1st XI`,
          abbreviatedName: school.abbreviation,
          schoolId: schoolId,
          divisionId: div1Id,
          suffix: "1st XI",
          teamColors: school.brandColors,
          logoUrl: school.logoUrl,
          createdAt: new Date().toISOString()
        });
        addLog(`Team '${school.abbreviation} 1st XI' created`);

        // U16A
        await createDocument("teams", {
          name: `${school.abbreviation} U16A`,
          abbreviatedName: school.abbreviation,
          schoolId: schoolId,
          divisionId: divU16Id,
          suffix: "U16A",
          teamColors: school.brandColors,
          logoUrl: school.logoUrl,
          createdAt: new Date().toISOString()
        });
        addLog(`Team '${school.abbreviation} U16A' created`);
      }

      setStatus("Success!");
      addLog("Database seeding completed successfully.");

    } catch (error: any) {
      console.error("Seeding error:", error);
      setStatus("Error");
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedPlayers = async () => {
    setLoading(true);
    setStatus("Seeding Players...");
    setLogs([]);

    try {
      addLog("Fetching existing teams...");
      const teams = await fetchTeams();
      
      if (teams.length === 0) {
        throw new Error("No teams found. Please seed teams first.");
      }

      addLog(`Found ${teams.length} teams. Creating players...`);

      const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Donald", "Mark"];
      const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"];

      for (const team of teams) {
        addLog(`Creating players for ${team.name}...`);
        
        // Create 12 players per team
        const playerCount = 12; 
        
        for (let i = 0; i < playerCount; i++) {
           const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
           const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
           
           // Vary roles
           let primaryRole = "Batsman";
           if (i > 6) primaryRole = "Bowler";
           if (i === 5) primaryRole = "All-Rounder";
           if (i === 0) primaryRole = "Wicketkeeper";

           await createDocument("people", {
             firstName,
             lastName,
             email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random()*10000)}@example.com`,
             role: "Player",
             teamIds: [team.id],
             schoolId: team.schoolId,
             primaryRole,
             battingStyle: Math.random() > 0.8 ? "Left-hand bat" : "Right-hand bat",
             bowlingStyle: (primaryRole === "Bowler" || primaryRole === "All-Rounder") ? "Right-arm fast" : undefined,
             createdAt: new Date().toISOString()
           });
        }
        addLog(`Created ${playerCount} players for ${team.name}`);
      }
      
      setStatus("Success!");
      addLog("Player seeding completed.");

    } catch (error: any) {
      console.error("Seeding error:", error);
      setStatus("Error");
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" /> Database Seeder
          </CardTitle>
          <CardDescription>
            Populate Firestore with initial data for Schools, Teams, Divisions, and Seasons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Warning</p>
              <p>This will create new documents in your Firestore database. It does not delete existing data, so running it multiple times will create duplicates.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
                onClick={handleSeed} 
                disabled={loading} 
                className="w-full"
                size="lg"
            >
                {loading && status === "Seeding..." ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding DB...
                </>
                ) : (
                "Seed Database (Teams)"
                )}
            </Button>
            <Button 
                onClick={handleSeedPlayers} 
                disabled={loading} 
                className="w-full"
                variant="secondary"
                size="lg"
            >
                {loading && status === "Seeding Players..." ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding Players...
                </>
                ) : (
                "Seed Players"
                )}
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="bg-muted rounded-md p-4 h-64 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="border-b border-border/50 pb-1 last:border-0">
                  {log}
                </div>
              ))}
              {status === "Success" && (
                <div className="text-green-600 font-bold pt-2">✨ Done!</div>
              )}
              {status === "Error" && (
                <div className="text-destructive font-bold pt-2">❌ Failed</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
