"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Circle, CheckCircle2, XCircle } from "lucide-react";

type DRSMode = 'BallTracking' | 'UltraEdge';

interface DRSViewProps {
  onComplete: (decision: 'Out' | 'Not Out') => void;
}

export function DRSView({ onComplete }: DRSViewProps) {
  const [mode, setMode] = useState<DRSMode>('UltraEdge');
  const [step, setStep] = useState(0);
  const [decision, setDecision] = useState<'Out' | 'Not Out' | null>(null);

  useEffect(() => {
    // Simulate the review process sequence
    const sequence = [
      { t: 1000, action: () => setStep(1) }, // Checking Front Foot
      { t: 3000, action: () => setStep(2) }, // UltraEdge
      { t: 6000, action: () => { setMode('BallTracking'); setStep(3); } }, // Ball Tracking
      { t: 9000, action: () => setStep(4) }, // Impact
      { t: 11000, action: () => setStep(5) }, // Wickets
      { t: 13000, action: () => {
        const result = Math.random() > 0.5 ? 'Out' : 'Not Out';
        setDecision(result);
        onComplete(result);
      }}
    ];

    let timeouts: NodeJS.Timeout[] = [];
    sequence.forEach(({ t, action }) => {
      timeouts.push(setTimeout(action, t));
    });

    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity color="var(--color-primary)" />
          Third Umpire Review
        </h3>
        <Badge variant="destructive">Live</Badge>
      </div>

      <div style={{ 
        flex: 1, 
        background: '#000', 
        borderRadius: '12px', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Step 1: Front Foot */}
        {step === 1 && (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2>Checking Front Foot...</h2>
            <div style={{ width: '200px', height: '2px', background: 'white', margin: '2rem auto', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '40%', width: '20px', height: '20px', background: 'lime', borderRadius: '50%' }}></div>
            </div>
            <Badge variant="default">Fair Delivery</Badge>
          </div>
        )}

        {/* Step 2: UltraEdge */}
        {step === 2 && (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>UltraEdge</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '100px' }}>
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} style={{ 
                  width: '4px', 
                  height: `${Math.random() * 20 + 5}%`, 
                  background: 'cyan',
                  animation: 'wave 0.2s infinite'
                }}></div>
              ))}
            </div>
            <p style={{ color: 'white', marginTop: '1rem' }}>No spike detected</p>
          </div>
        )}

        {/* Step 3-5: Ball Tracking */}
        {step >= 3 && step < 6 && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'white' }}>
              <h2>Ball Tracking</h2>
            </div>
            
            {/* Pitch */}
            <div style={{ 
              position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%) perspective(500px) rotateX(40deg)',
              width: '200px', height: '400px', background: '#4a6741', border: '2px solid white'
            }}></div>

            {/* Stumps */}
            <div style={{ 
              position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '5px'
            }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ width: '5px', height: '60px', background: 'white' }}></div>
              ))}
            </div>

            {/* Ball Path Animation */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <path 
                d="M 150 400 Q 200 300 250 250 T 300 150" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeDasharray="10"
              />
              <circle cx="300" cy="150" r="8" fill="red">
                <animate attributeName="opacity" values="0;1" dur="0.5s" repeatCount="indefinite" />
              </circle>
            </svg>

            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', gap: '1rem' }}>
              <Badge variant={step >= 3 ? 'default' : 'secondary'}>Pitching: In Line</Badge>
              <Badge variant={step >= 4 ? 'default' : 'secondary'}>Impact: In Line</Badge>
              <Badge variant={step >= 5 ? (Math.random() > 0.5 ? 'default' : 'destructive') : 'secondary'}>Wickets: {step >= 5 ? 'Hitting' : 'Checking...'}</Badge>
            </div>
          </div>
        )}

        {/* Final Decision */}
        {decision && (
          <div style={{ textAlign: 'center', animation: 'zoomIn 0.5s' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: decision === 'Out' ? '#ef4444' : '#10b981', textTransform: 'uppercase' }}>
              {decision}
            </h1>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2); }
        }
        @keyframes zoomIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
