"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { exportMatchesToCSV, exportPlayersToCSV, downloadCSV, exportToJSON } from "@/lib/utils/dataExport";

interface DataExportProps {
  matches?: any[];
  players?: any[];
}

export function DataExportPanel({ matches = [], players = [] }: DataExportProps) {
  const handleExportMatchesCSV = () => {
    const csv = exportMatchesToCSV(matches);
    downloadCSV(csv, `matches-${Date.now()}.csv`);
  };

  const handleExportPlayersCSV = () => {
    const csv = exportPlayersToCSV(players);
    downloadCSV(csv, `players-${Date.now()}.csv`);
  };

  const handleExportMatchesJSON = () => {
    exportToJSON(matches, `matches-${Date.now()}.json`);
  };

  const handleExportPlayersJSON = () => {
    exportToJSON(players, `players-${Date.now()}.json`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Matches</h3>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportMatchesCSV} 
              variant="outline"
              disabled={matches.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button 
              onClick={handleExportMatchesJSON} 
              variant="outline"
              disabled={matches.length === 0}
              className="gap-2"
            >
              <FileJson className="h-4 w-4" />
              Export as JSON
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} available
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Players</h3>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportPlayersCSV} 
              variant="outline"
              disabled={players.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button 
              onClick={handleExportPlayersJSON} 
              variant="outline"
              disabled={players.length === 0}
              className="gap-2"
            >
              <FileJson className="h-4 w-4" />
              Export as JSON
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {players.length} player{players.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
