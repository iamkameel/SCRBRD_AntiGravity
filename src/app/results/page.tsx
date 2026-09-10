"use client";

import { useEffect, useState } from 'react';
import { Trophy, FileText } from "lucide-react";
import { fetchResultsWithTeamNames, type ResultWithTeamNames } from "@/lib/results-data";
import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ResultCard } from "@/components/results/ResultCard";

export default function ResultsPage() {
  const [results, setResults] = useState<ResultWithTeamNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const data = await fetchResultsWithTeamNames();
        setResults(data);
      } catch (err: any) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []); 

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-12 w-12 rounded-2xl border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.textMuted }}>
          ACCESSING HISTORICAL DATA...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* High-Fidelity Header */}
      <SectionHeader 
        title="Match Results"
        sub="Official match records & performance history. Institutional verification confirmed."
        icon={<Trophy className="w-5 h-5 text-indigo-400" />}
      />

      {/* Results Feed */}
      <div className="grid gap-8">
        {results.length > 0 ? (
          results.map((result, index) => (
            <ResultCard key={result.id} result={result} index={index} />
          ))
        ) : (
          <div className="p-24 rounded-[3rem] border border-dashed text-center space-y-4"
               style={{ background: D.surf1, borderColor: D.border }}>
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto opacity-20"
                 style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
              <FileText className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase italic" style={{ color: D.textPrimary, fontFamily: D.head }}>
                No Results Archived
              </h3>
              <p className="text-sm font-medium" style={{ color: D.textMuted }}>
                Completed match outcomes will be indexed here automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
