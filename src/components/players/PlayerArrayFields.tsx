import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Simple ID generator since uuid is not installed
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Types (mirrored from firestore.ts for local usage)
interface PlayerTrait {
  traitId: string;
  name: string;
}

interface RoleRating {
  roleRatingId: string;
  roleCode: string;
  rating: number;
}

interface ZoneAnalysis {
  zoneId: string;
  type: 'strength' | 'weakness';
  zoneLabel: string;
  description: string;
}

interface CoachReport {
  reportId: string;
  summary: string;
  pros: string;
  cons: string;
  createdAt: string;
  coachId: string;
}

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  achievedOn: string;
}

// --- Traits Manager ---
export function TraitsManager({ initialData = [], onChange }: { initialData?: PlayerTrait[], onChange: (data: PlayerTrait[]) => void }) {
  const [traits, setTraits] = useState<PlayerTrait[]>(initialData);
  const [newTrait, setNewTrait] = useState('');

  const addTrait = () => {
    if (!newTrait.trim()) return;
    const updated = [...traits, { traitId: generateId(), name: newTrait.trim() }];
    setTraits(updated);
    onChange(updated);
    setNewTrait('');
  };

  const removeTrait = (id: string) => {
    const updated = traits.filter(t => t.traitId !== id);
    setTraits(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input 
          placeholder="Add a new trait (e.g. 'Plays spin well')" 
          value={newTrait} 
          onChange={(e) => setNewTrait(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
        />
        <Button type="button" onClick={addTrait} size="icon"><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {traits.map(trait => (
          <Badge key={trait.traitId} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
            {trait.name}
            <button type="button" onClick={() => removeTrait(trait.traitId)} className="hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {traits.length === 0 && <p className="text-sm text-muted-foreground italic">No traits added yet.</p>}
      </div>
    </div>
  );
}

// --- Role Ratings Manager ---
export function RoleRatingsManager({ initialData = [], onChange }: { initialData?: RoleRating[], onChange: (data: RoleRating[]) => void }) {
  const [ratings, setRatings] = useState<RoleRating[]>(initialData);
  const [newRole, setNewRole] = useState('');
  const [newRating, setNewRating] = useState(10);

  const addRating = () => {
    if (!newRole.trim()) return;
    const updated = [...ratings, { roleRatingId: generateId(), roleCode: newRole.trim(), rating: newRating }];
    setRatings(updated);
    onChange(updated);
    setNewRole('');
    setNewRating(10);
  };

  const removeRating = (id: string) => {
    const updated = ratings.filter(r => r.roleRatingId !== id);
    setRatings(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_100px_auto] gap-2 items-end">
        <div className="space-y-1">
          <Label>Role Name</Label>
          <Input 
            placeholder="e.g. Opening Batsman" 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Rating (1-20)</Label>
          <Input 
            type="number" 
            min="1" 
            max="20" 
            value={newRating} 
            onChange={(e) => setNewRating(Number(e.target.value))}
          />
        </div>
        <Button type="button" onClick={addRating} size="icon"><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        {ratings.map(r => (
          <div key={r.roleRatingId} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
            <span className="font-medium">{r.roleCode}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-4 w-4 fill-current" />
                {r.rating}
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRating(r.roleRatingId)}>
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {ratings.length === 0 && <p className="text-sm text-muted-foreground italic">No role ratings added.</p>}
      </div>
    </div>
  );
}

// --- Zone Analysis Manager ---
export function ZoneAnalysisManager({ initialData = [], onChange }: { initialData?: ZoneAnalysis[], onChange: (data: ZoneAnalysis[]) => void }) {
  const [zones, setZones] = useState<ZoneAnalysis[]>(initialData);
  const [type, setType] = useState<'strength' | 'weakness'>('strength');
  const [label, setLabel] = useState('');
  const [desc, setDesc] = useState('');

  const addZone = () => {
    if (!label.trim()) return;
    const updated = [...zones, { zoneId: generateId(), type, zoneLabel: label.trim(), description: desc.trim() }];
    setZones(updated);
    onChange(updated);
    setLabel('');
    setDesc('');
  };

  const removeZone = (id: string) => {
    const updated = zones.filter(z => z.zoneId !== id);
    setZones(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border p-4 rounded-md bg-muted/20">
        <h4 className="text-sm font-semibold">Add New Analysis Zone</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="weakness">Weakness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Zone Label</Label>
            <Input placeholder="e.g. Outside Off Stump" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Detailed analysis of this zone..." value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <Button type="button" onClick={addZone} className="w-full">Add Zone Analysis</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {zones.filter(z => z.type === 'strength').map(z => (
              <div key={z.zoneId} className="p-2 border rounded text-sm relative group">
                <div className="font-semibold">{z.zoneLabel}</div>
                <div className="text-muted-foreground text-xs mt-1">{z.description}</div>
                <button 
                  type="button" 
                  onClick={() => removeZone(z.zoneId)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
            {zones.filter(z => z.type === 'strength').length === 0 && <p className="text-xs text-muted-foreground">No strengths recorded.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Weaknesses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {zones.filter(z => z.type === 'weakness').map(z => (
              <div key={z.zoneId} className="p-2 border rounded text-sm relative group">
                <div className="font-semibold">{z.zoneLabel}</div>
                <div className="text-muted-foreground text-xs mt-1">{z.description}</div>
                <button 
                  type="button" 
                  onClick={() => removeZone(z.zoneId)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
            {zones.filter(z => z.type === 'weakness').length === 0 && <p className="text-xs text-muted-foreground">No weaknesses recorded.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Coach Reports Manager ---
export function CoachReportsManager({ initialData = [], onChange }: { initialData?: CoachReport[], onChange: (data: CoachReport[]) => void }) {
  const [reports, setReports] = useState<CoachReport[]>(initialData);
  const [summary, setSummary] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');

  const addReport = () => {
    if (!summary.trim()) return;
    const updated = [...reports, { 
      reportId: generateId(), 
      summary: summary.trim(), 
      pros: pros.trim(), 
      cons: cons.trim(),
      createdAt: new Date().toISOString(),
      coachId: 'current-user' // Ideally get from auth context, but for now placeholder
    }];
    setReports(updated);
    onChange(updated);
    setSummary('');
    setPros('');
    setCons('');
  };

  const removeReport = (id: string) => {
    const updated = reports.filter(r => r.reportId !== id);
    setReports(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border p-4 rounded-md bg-muted/20">
        <h4 className="text-sm font-semibold">New Coach Report</h4>
        <div className="space-y-2">
          <Label>Summary</Label>
          <Textarea placeholder="Overall assessment..." value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pros</Label>
            <Textarea placeholder="Key strengths..." value={pros} onChange={(e) => setPros(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cons</Label>
            <Textarea placeholder="Areas for improvement..." value={cons} onChange={(e) => setCons(e.target.value)} />
          </div>
        </div>
        <Button type="button" onClick={addReport} className="w-full">Add Report</Button>
      </div>

      <div className="space-y-4">
        {reports.map((report, idx) => (
          <Card key={report.reportId}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Report #{idx + 1} - {new Date(report.createdAt).toLocaleDateString()}</CardTitle>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeReport(report.reportId)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="font-semibold">Summary:</span> {report.summary}</div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="text-green-700 bg-green-50 p-2 rounded">
                  <span className="font-semibold block mb-1">Pros:</span> {report.pros}
                </div>
                <div className="text-red-700 bg-red-50 p-2 rounded">
                  <span className="font-semibold block mb-1">Cons:</span> {report.cons}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-4">No coach reports available.</p>}
      </div>
    </div>
  );
}

// --- Achievements Manager ---
export function AchievementsManager({ initialData = [], onChange }: { initialData?: Achievement[], onChange: (data: Achievement[]) => void }) {
  const [achievements, setAchievements] = useState<Achievement[]>(initialData);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');

  const addAchievement = () => {
    if (!title.trim()) return;
    const updated = [...achievements, { 
      achievementId: generateId(), 
      title: title.trim(), 
      description: desc.trim(),
      achievedOn: date || new Date().toISOString()
    }];
    setAchievements(updated);
    onChange(updated);
    setTitle('');
    setDesc('');
    setDate('');
  };

  const removeAchievement = (id: string) => {
    const updated = achievements.filter(a => a.achievementId !== id);
    setAchievements(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border p-4 rounded-md bg-muted/20">
        <h4 className="text-sm font-semibold">Add Achievement</h4>
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Man of the Match vs WBHS" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Details..." value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <Button type="button" onClick={addAchievement} className="w-full">Add Achievement</Button>
      </div>

      <div className="space-y-2">
        {achievements.map(a => (
          <div key={a.achievementId} className="flex items-start justify-between p-3 border rounded-md">
            <div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-muted-foreground">{a.description}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(a.achievedOn).toLocaleDateString()}</div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeAchievement(a.achievementId)}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
        {achievements.length === 0 && <p className="text-sm text-muted-foreground italic">No achievements recorded.</p>}
      </div>
    </div>
  );
}
