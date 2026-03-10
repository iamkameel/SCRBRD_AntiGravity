import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Simple ID generator since uuid is not installed
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// --- Coach Traits Manager ---
export function CoachTraitsManager({ initialData = [], onChange }: { initialData?: string[], onChange: (data: string[]) => void }) {
  const [traits, setTraits] = useState<string[]>(initialData);
  const [newTrait, setNewTrait] = useState('');

  const addTrait = () => {
    if (!newTrait.trim()) return;
    if (traits.includes(newTrait.trim())) return; // Prevent duplicates
    const updated = [...traits, newTrait.trim()];
    setTraits(updated);
    onChange(updated);
    setNewTrait('');
  };

  const removeTrait = (traitToRemove: string) => {
    const updated = traits.filter(t => t !== traitToRemove);
    setTraits(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Philosophy Tags & Traits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="e.g. Data-Driven, Player-Centred" 
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
          />
          <Button type="button" onClick={addTrait} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {traits.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No traits added yet.</span>
          )}
          {traits.map((trait) => (
            <Badge key={trait} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {trait}
              <button 
                type="button" 
                onClick={() => removeTrait(trait)}
                className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Coach Season Stats Manager ---
interface CoachSeasonStats {
  seasonId: string;
  teamId: string;
  matches: number;
  wins: number;
  losses: number;
  noResults: number;
  titlesWon: number;
  finalsReached: number;
  avgMarginRuns: number;
  avgMarginWickets: number;
  chaseSuccessRate: number;
}

export function CoachSeasonStatsManager({ initialData = [], onChange }: { initialData?: CoachSeasonStats[], onChange: (data: CoachSeasonStats[]) => void }) {
  const [stats, setStats] = useState<CoachSeasonStats[]>(initialData);
  
  // Form State
  const [seasonId, setSeasonId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [matches, setMatches] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [titles, setTitles] = useState(0);

  const addStats = () => {
    if (!seasonId || !teamId) return;
    
    const newStat: CoachSeasonStats = {
      seasonId,
      teamId,
      matches,
      wins,
      losses,
      noResults: matches - (wins + losses),
      titlesWon: titles,
      finalsReached: 0, // Simplified for manual entry
      avgMarginRuns: 0,
      avgMarginWickets: 0,
      chaseSuccessRate: 0
    };

    const updated = [...stats, newStat];
    setStats(updated);
    onChange(updated);
    
    // Reset
    setSeasonId('');
    setTeamId('');
    setMatches(0);
    setWins(0);
    setLosses(0);
    setTitles(0);
  };

  const removeStats = (index: number) => {
    const updated = stats.filter((_, i) => i !== index);
    setStats(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Season History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/5">
          <div className="space-y-2">
            <Label>Season</Label>
            <Input placeholder="e.g. 2023/24" value={seasonId} onChange={e => setSeasonId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Team</Label>
            <Input placeholder="e.g. 1st XI" value={teamId} onChange={e => setTeamId(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 gap-2 col-span-2">
            <div className="space-y-1">
              <Label className="text-xs">Matches</Label>
              <Input type="number" value={matches} onChange={e => setMatches(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Wins</Label>
              <Input type="number" value={wins} onChange={e => setWins(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Losses</Label>
              <Input type="number" value={losses} onChange={e => setLosses(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Titles</Label>
              <Input type="number" value={titles} onChange={e => setTitles(Number(e.target.value))} />
            </div>
          </div>
          <Button type="button" onClick={addStats} className="col-span-2 w-full">Add Season Record</Button>
        </div>

        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-card">
              <div>
                <div className="font-medium text-sm">{stat.teamId} ({stat.seasonId})</div>
                <div className="text-xs text-muted-foreground">
                  P: {stat.matches} | W: {stat.wins} | L: {stat.losses} | Titles: {stat.titlesWon}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeStats(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
