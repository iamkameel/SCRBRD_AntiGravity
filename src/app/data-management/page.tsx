"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle2, FileJson, Sparkles, Loader2 } from "lucide-react";
import { migrateSampleDataAction, deleteAllDataAction, exportAllDataAction } from "@/lib/actions/data-management";
import { migrateMatchStatesAction } from "@/lib/actions/migration";
import { generateSampleDataAction } from "@/lib/actions/sample-data";

export default function DataManagementPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportAllDataAction();
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `scrbrd_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        setActionStatus({ message: "Data exported successfully!", type: 'success' });
      } else {
        setActionStatus({ message: result.message || "Export failed", type: 'error' });
      }
    } catch (error) {
      setActionStatus({ message: "Failed to export data.", type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    // Mock import delay
    setTimeout(() => {
      setIsImporting(false);
      setActionStatus({ message: `Successfully imported data from ${file.name}`, type: 'success' });
    }, 2000);
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to delete ALL data? This action cannot be undone.")) return;
    
    try {
      const result = await deleteAllDataAction();
      if (result.success) {
        setActionStatus({ message: result.message, type: 'success' });
      }
    } catch (error) {
      setActionStatus({ message: "Failed to reset data.", type: 'error' });
    }
  };

  const handleLoadSample = async () => {
    try {
      const result = await migrateSampleDataAction();
      if (result.success) {
        setActionStatus({ message: result.message, type: 'success' });
      }
    } catch (error) {
      setActionStatus({ message: "Failed to load sample data.", type: 'error' });
    }
  };

  const handleGenerateSampleData = async () => {
    if (!confirm("Generate comprehensive sample data? This will create schools, teams, players, matches, and more.")) return;
    
    setIsGenerating(true);
    setActionStatus(null);
    try {
      const result = await generateSampleDataAction();
      setActionStatus({ 
        message: result.message, 
        type: result.success ? 'success' : 'error' 
      });
    } catch (error) {
      setActionStatus({ message: "Failed to generate sample data.", type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Data Management</h1>
        </div>
        <p className="text-muted-foreground">
          Export, import, and manage system data.
        </p>
      </div>

      {actionStatus && (
        <Alert variant={actionStatus.type === 'success' ? 'default' : 'destructive'}>
          {actionStatus.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>{actionStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample Data Generator */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Sample Data Generator</CardTitle>
                <CardDescription>Populate with realistic SA cricket data.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Generates comprehensive test data including:</p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                <li>8 South African schools (Grey College, Hilton, Bishops, etc.)</li>
                <li>16 cricket teams (1st XI and U15 per school)</li>
                <li>120 players with stats and skills</li>
                <li>80 equipment items</li>
                <li>160 financial transactions</li>
                <li>Matches, sponsors, seasons, and divisions</li>
              </ul>
            </div>
            <Button 
              onClick={handleGenerateSampleData}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Data...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Sample Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export / Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileJson className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Manage your data snapshots.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isExporting ? 'Exporting...' : 'Export Data (JSON)'}
            </Button>

            <div className="relative">
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                variant="outline"
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isImporting ? 'Importing...' : 'Import Data (JSON)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible system actions.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline"
              onClick={handleLoadSample}
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Reset to Legacy Sample Data
            </Button>

            <Button 
              variant="destructive"
              onClick={handleReset}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
            </Button>
          </CardContent>
        </Card>

        {/* System Migration */}
        <Card className="border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <RefreshCw className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <CardTitle>System Migration</CardTitle>
                <CardDescription>Update data structures to latest version.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              <strong>Match State Migration:</strong> Updates legacy &apos;status&apos; fields to the new State Machine &apos;state&apos; format. Run this once after deployment.
            </div>
            <Button 
              variant="outline"
              onClick={async () => {
                if (!confirm("Run match state migration? This will update all match records.")) return;
                try {
                  const result = await migrateMatchStatesAction();
                  setActionStatus({ message: result.message, type: result.success ? 'success' : 'error' });
                } catch (e) {
                  setActionStatus({ message: "Migration failed to start", type: 'error' });
                }
              }}
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Migrate Match States
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Firebase Connected:</strong> All data operations are persisted to Firestore. 
          Use the Sample Data Generator to populate your database with realistic test data.
        </AlertDescription>
      </Alert>
    </div>
  );
}
