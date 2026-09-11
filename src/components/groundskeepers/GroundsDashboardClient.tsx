"use client";

import { useState } from "react";
import { Field, Match, Person } from "@/types/firestore";
import { D } from '@/lib/design-system';
import { 
  Droplets, 
  Wind, 
  Sun, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Scissors,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";

interface GroundsDashboardClientProps {
  fields: Field[];
  upcomingMatches: Match[];
  currentUser?: Person;
}

export function GroundsDashboardClient({ fields, upcomingMatches, currentUser }: GroundsDashboardClientProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || "");
  const selectedField = fields.find(f => f.id === selectedFieldId) || fields[0];

  const fieldMatches = upcomingMatches.filter(m => m.fieldId === selectedFieldId);
  const nextMatch = fieldMatches[0];

  // Design Primitives
  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: D.textMuted }}>{children}</div>
  );

  const Card = ({ children, title, icon: Icon, action }: { children: React.ReactNode, title?: string, icon?: any, action?: React.ReactNode }) => (
    <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.xl, padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {(title || Icon) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {Icon && <Icon size={18} color={D.textMuted} />}
            {title && <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', color: D.textPrimary }}>{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );

  const Stat = ({ label, value, sub }: { label: string, value: string, sub?: string }) => (
    <div>
      <Lbl>{label}</Lbl>
      <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: D.head, marginTop: '4px' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ background: D.base, minHeight: '100vh', paddingBottom: '80px', color: D.textPrimary }}>
      
      {/* Top Navigation */}
      <div style={{ 
        borderBottom: `1px solid ${D.border}`, 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/home" style={{ color: D.textMuted }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <h1 style={{ fontFamily: D.head, fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em' }}>
              GROUNDS <span style={{ color: D.sky }}>OPERATIONS</span>
            </h1>
            <div style={{ fontSize: '11px', color: D.textMuted, letterSpacing: '0.05em' }}>SCHOOL SPORTS OS</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            style={{ 
              background: D.surf2, 
              border: `1px solid ${D.border}`, 
              color: D.textPrimary,
              borderRadius: D.md,
              padding: '6px 12px',
              fontSize: '13px',
              fontFamily: D.body,
              outline: 'none'
            }}
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: D.surf2, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} color={D.emerald} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          
          {/* Main Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header / Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <Card>
                <Stat label="Field Status" value={selectedField?.status || "Available"} sub="Ready for play" />
              </Card>
              <Card>
                <Stat label="Condition" value="4.8" sub="/ 5.0 Rating" />
              </Card>
              <Card>
                <Stat label="Moisture" value="12%" sub="Optimum range" />
              </Card>
              <Card>
                <Stat label="Last Prep" value="2h ago" sub="Roller session" />
              </Card>
            </div>

            {/* Next Match Card */}
            {nextMatch ? (
              <Card title="NEXT FIXTURE" icon={Calendar} action={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: D.head, borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  <Clock size={12} /> {nextMatch.matchTime ? "In 2 Days" : "Upcoming"}
                </div>
              }>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: D.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <span style={{ fontWeight: 900, fontSize: '20px' }}>H</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{nextMatch.homeTeamName || 'Home'}</div>
                    </div>
                    <div style={{ color: D.textMuted, fontWeight: 900, fontSize: '14px' }}>VS</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: D.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <span style={{ fontWeight: 900, fontSize: '20px' }}>A</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{nextMatch.awayTeamName || 'Away'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Lbl>Requirements</Lbl>
                    <div style={{ fontSize: '14px', marginTop: '4px' }}>T20 Format • White Ball</div>
                    <div style={{ fontSize: '12px', color: D.textMuted }}>Pitch #4 Requested</div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Calendar size={48} color={D.textMuted} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <h3 style={{ fontWeight: 800 }}>No Upcoming Matches</h3>
                  <p style={{ color: D.textMuted, fontSize: '13px' }}>Check back later for field assignments.</p>
                </div>
              </Card>
            )}

            {/* Readiness Checklist */}
            <Card title="READINESS CHECKLIST" icon={CheckCircle2}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Lbl>Pitch Preparation</Lbl>
                  {[
                    { label: "Mowing & Rolling", icon: Scissors, done: true },
                    { label: "Popping Crease Marking", icon: TrendingUp, done: true },
                    { label: "Moisture Levels Checked", icon: Droplets, done: false },
                    { label: "Stumps & Bails Ready", icon: AlertCircle, done: false }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D.surf2, padding: '12px 16px', borderRadius: D.md }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <item.icon size={16} color={item.done ? D.emerald : D.textMuted} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                      </div>
                      {item.done ? <CheckCircle2 size={16} color={D.emerald} /> : <Circle size={16} color={D.border} />}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Lbl>Outfield & Boundary</Lbl>
                  {[
                    { label: "Outfield Mowed to 12mm", icon: Scissors, done: true },
                    { label: "Boundary Rope Positioned", icon: MapPin, done: true },
                    { label: "Inner Ring Markers", icon: MapPin, done: false },
                    { label: "Sight Screens Cleaned", icon: MapPin, done: false }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D.surf2, padding: '12px 16px', borderRadius: D.md }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <item.icon size={16} color={item.done ? D.emerald : D.textMuted} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                      </div>
                      {item.done ? <CheckCircle2 size={16} color={D.emerald} /> : <Circle size={16} color={D.border} />}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Weather Widget */}
            <Card title="LOCAL WEATHER" icon={Sun}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, fontFamily: D.head }}>24°C</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: D.textMuted, fontSize: '12px' }}>
                    <Droplets size={14} /> 42%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: D.textMuted, fontSize: '12px' }}>
                    <Wind size={14} /> 12km/h
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', borderTop: `1px solid ${D.border}`, paddingTop: '16px' }}>
                <Lbl>48hr Forecast</Lbl>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  {['WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: D.textMuted }}>{day}</div>
                      <Sun size={14} style={{ margin: '4px auto' }} />
                      <div style={{ fontSize: '11px', fontWeight: 900 }}>26°</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Field Specs */}
            <Card title="FIELD SPECS" icon={MapPin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <Lbl>Pitch Type</Lbl>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedField?.pitchType || 'Natural Turf'}</div>
                </div>
                <div>
                  <Lbl>Orientation</Lbl>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>North-South</div>
                </div>
                <div>
                  <Lbl>Lighting</Lbl>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>LED Floodlights Installed</div>
                </div>
              </div>
            </Card>

            {/* Booking Conflict Viewer */}
            <Card title="BOOKING CONFLICTS" icon={AlertCircle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: `1px solid rgba(239, 68, 68, 0.2)`, borderRadius: D.lg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: D.textPrimary, marginBottom: '4px' }}>
                    <AlertCircle size={14} color="#ef4444" />
                    <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: D.head }}>TIME OVERLAP DETECTED</span>
                  </div>
                  <div style={{ fontSize: '11px', color: D.textMuted }}>U15A vs Selborne (14:00) overlaps with Pitch Maintenance (13:30).</div>
                </div>
                
                <div style={{ fontSize: '11px', color: D.textMuted, textAlign: 'center', paddingTop: '8px' }}>
                  No other conflicts found for the next 7 days.
                </div>
              </div>
            </Card>

            <button style={{ 
              width: '100%', 
              background: D.emerald, 
              color: '#000', 
              border: 'none', 
              borderRadius: D.md, 
              padding: '14px', 
              fontFamily: D.head, 
              fontWeight: 800, 
              fontSize: '13px',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}>
              CONFIRM FIELD READINESS
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
