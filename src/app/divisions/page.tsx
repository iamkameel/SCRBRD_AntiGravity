import { fetchDivisions, fetchTeams } from "@/lib/firestore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DivisionsPage() {
  const [divisions, teams] = await Promise.all([
    fetchDivisions(),
    fetchTeams()
  ]);

  return (
    <div>
      <header className="flex-between mb-4">
        <div>
          <h1>Divisions</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Manage age divisions and team categories
          </p>
        </div>
        <button className="btn btn-primary" style={{
          backgroundColor: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-glow)'
        }}>+ Add Division</button>
      </header>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {divisions.map((division) => {
          const divisionTeams = teams.filter((t) => t.divisionId === division.id);
          
          return (
            <Card key={division.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{division.name}</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {division.ageGroup} • Season {division.season}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>Teams: </span>
                      <Badge variant="default">{divisionTeams.length}</Badge>
                    </div>
                    
                    {divisionTeams.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {divisionTeams.map((team) => (
                          <span key={team.id} className="text-muted" style={{ fontSize: '0.875rem' }}>
                            {team.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {divisions.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-muted">No divisions found. Create your first division to get started.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

