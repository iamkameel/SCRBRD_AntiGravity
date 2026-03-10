"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Team, Field } from "@/types/firestore";
import { fetchTeams, fetchFields } from "@/lib/firestore";
import { DRILLS } from "@/lib/drills";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, ChevronRight, Users } from "lucide-react";

type PlannedSession = {
  sessionId: string;
  date: string;
  time: string;
  durationMinutes: number;
  teamId: string;
  venue: string;
  focus: string;
  drills: string[]; // drillIds
};

export default function PlannerPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const [sessions, setSessions] = useState<PlannedSession[]>([
    {
      sessionId: 's1',
      date: '2024-03-25',
      time: '15:00',
      durationMinutes: 90,
      teamId: 't1',
      venue: "St. John's Main Oval",
      focus: 'Batting against spin',
      drills: ['d1', 'd4']
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState<Partial<PlannedSession>>({
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    durationMinutes: 90,
    drills: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedTeams, fetchedFields] = await Promise.all([
          fetchTeams(),
          fetchFields()
        ]);
        setTeams(fetchedTeams);
        setFields(fetchedFields as Field[]);
      } catch (error) {
        console.error("Failed to load planner data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.teamId || !newSession.venue || !newSession.focus) return;

    const session: PlannedSession = {
      sessionId: `s${Date.now()}`,
      date: newSession.date!,
      time: newSession.time!,
      durationMinutes: newSession.durationMinutes!,
      teamId: newSession.teamId,
      venue: newSession.venue,
      focus: newSession.focus,
      drills: newSession.drills || []
    };

    setSessions([...sessions, session]);
    setIsCreating(false);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      durationMinutes: 90,
      drills: []
    });
  };

  const toggleDrillSelection = (drillId: string) => {
    const currentDrills = newSession.drills || [];
    if (currentDrills.includes(drillId)) {
      setNewSession({ ...newSession, drills: currentDrills.filter(id => id !== drillId) });
    } else {
      setNewSession({ ...newSession, drills: [...currentDrills, drillId] });
    }
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.sessionId !== id));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading planner...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Coach&apos;s Planner</h1>
          <p className="text-secondary">Schedule and organize training sessions.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          style={{ 
            background: 'var(--color-primary)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '8px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}
        >
          <Plus size={20} />
          New Session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Calendar / List View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sessions.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <CalendarIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>No sessions scheduled</h3>
              <p>Create a new session to get started.</p>
            </Card>
          ) : (
            sessions.map(session => {
              const team = teams.find(t => t.id === session.teamId);
              return (
                <Card key={session.sessionId} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        minWidth: '60px'
                      }}>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                          {new Date(session.date).toLocaleString('default', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {new Date(session.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{session.focus}</h3>
                        <div style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          {team?.name || 'Unknown Team'}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteSession(session.sessionId)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      {session.time} ({session.durationMinutes} min)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} />
                      {session.venue}
                    </div>
                  </div>

                  {session.drills.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Planned Drills</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {session.drills.map(drillId => {
                          const drill = DRILLS.find(d => d.drillId === drillId);
                          return drill ? (
                            <Badge key={drillId} variant="outline">{drill.title}</Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Sidebar / Upcoming */}
        <div>
          <Card>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} />
              My Teams
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {teams.slice(0, 3).map(team => (
                <div key={team.id} style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{team.name}</span>
                  <ChevronRight size={16} color="var(--color-text-muted)" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Session Modal Overlay */}
      {isCreating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <Card style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Plan New Session</h2>
            <form onSubmit={handleCreateSession}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                  <input 
                    type="date" 
                    required
                    value={newSession.date}
                    onChange={e => setNewSession({...newSession, date: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Time</label>
                  <input 
                    type="time" 
                    required
                    value={newSession.time}
                    onChange={e => setNewSession({...newSession, time: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Team</label>
                <select 
                  required
                  value={newSession.teamId || ''}
                  onChange={e => setNewSession({...newSession, teamId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                >
                  <option value="">Select a team...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Venue</label>
                <select 
                  required
                  value={newSession.venue || ''}
                  onChange={e => setNewSession({...newSession, venue: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                >
                  <option value="">Select a venue...</option>
                  {fields.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Session Focus</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Fielding drills and fitness"
                  value={newSession.focus || ''}
                  onChange={e => setNewSession({...newSession, focus: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Add Drills</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.5rem' }}>
                  {DRILLS.map(drill => (
                    <div 
                      key={drill.drillId}
                      onClick={() => toggleDrillSelection(drill.drillId)}
                      style={{ 
                        padding: '0.5rem', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        background: newSession.drills?.includes(drill.drillId) ? 'rgba(255,255,255,0.1)' : 'transparent',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--color-primary)',
                        background: newSession.drills?.includes(drill.drillId) ? 'var(--color-primary)' : 'transparent'
                      }}></div>
                      <span style={{ fontSize: '0.9rem' }}>{drill.title}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{drill.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ background: 'var(--color-primary)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Save Session
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
