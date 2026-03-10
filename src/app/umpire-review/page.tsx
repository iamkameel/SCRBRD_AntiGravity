"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/firestore";
import { fetchMatches } from "@/lib/firestore";
import { DRSView } from "@/components/umpire/DRSView";
import { Gavel, Eye, AlertTriangle, Check, X } from "lucide-react";

export default function UmpireReviewPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'Out' | 'Not Out' | null>(null);
  const [logs, setLogs] = useState<{ time: string; event: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const fetchedMatches = await fetchMatches(20);
        setMatches(fetchedMatches);
        if (fetchedMatches.length > 0) {
          setSelectedMatchId(fetchedMatches[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch matches", error);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  const handleLogEvent = (event: string) => {
    setLogs([{ time: new Date().toLocaleTimeString(), event }, ...logs]);
  };

  const startReview = () => {
    setIsReviewing(true);
    setReviewDecision(null);
    handleLogEvent("DRS Review Requested");
  };

  const handleReviewComplete = (decision: 'Out' | 'Not Out') => {
    setReviewDecision(decision);
    handleLogEvent(`Review Decision: ${decision}`);
    // Keep the result on screen for a moment before resetting or allowing close
  };

  if (loading) {
    return <div className="p-8 text-center">Loading umpire dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Gavel size={32} color="var(--color-primary)" />
          Umpire Review System
        </h1>
        <p className="text-secondary">Match official dashboard and Decision Review System.</p>
      </div>

      {/* Match Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <select 
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            background: 'var(--color-bg-card)', 
            color: 'white',
            width: '100%',
            maxWidth: '400px',
            fontSize: '1rem'
          }}
        >
          {matches.map(m => (
            <option key={m.id} value={m.id}>
              {m.homeTeamName || 'Home Team'} vs {m.awayTeamName || 'Away Team'} ({m.dateTime ? new Date(m.dateTime as string).toLocaleDateString() : 'TBD'})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Main Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* DRS Screen */}
          <Card style={{ height: '500px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {isReviewing ? (
              <div style={{ flex: 1, padding: '1rem' }}>
                <DRSView onComplete={handleReviewComplete} />
                {reviewDecision && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button 
                      onClick={() => setIsReviewing(false)}
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        border: 'none', 
                        color: 'white', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Close Review
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <Eye size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--color-text-muted)' }}>Waiting for Review Request</h2>
                <button 
                  onClick={startReview}
                  style={{ 
                    marginTop: '1.5rem',
                    background: 'var(--color-primary)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '1rem 2rem', 
                    borderRadius: '8px', 
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <AlertTriangle size={24} />
                  INITIATE DRS
                </button>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <button 
              onClick={() => handleLogEvent("Wicket (Caught)")}
              style={{ padding: '1.5rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              WICKET
            </button>
            <button 
              onClick={() => handleLogEvent("Wide Ball")}
              style={{ padding: '1.5rem', borderRadius: '8px', border: 'none', background: 'var(--color-bg-card)', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              WIDE
            </button>
            <button 
              onClick={() => handleLogEvent("No Ball")}
              style={{ padding: '1.5rem', borderRadius: '8px', border: 'none', background: 'var(--color-bg-card)', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              NO BALL
            </button>
            <button 
              onClick={() => handleLogEvent("Boundary (4)")}
              style={{ padding: '1.5rem', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              FOUR
            </button>
            <button 
              onClick={() => handleLogEvent("Boundary (6)")}
              style={{ padding: '1.5rem', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              SIX
            </button>
          </div>
        </div>

        {/* Sidebar: Match Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Match Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
              {logs.length === 0 && <p className="text-secondary">No events logged yet.</p>}
              {logs.map((log, i) => (
                <div key={i} style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--color-primary)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{log.time}</div>
                  <div style={{ fontWeight: 500 }}>{log.event}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
