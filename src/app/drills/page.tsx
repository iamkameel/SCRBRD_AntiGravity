"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DRILLS, Drill, DrillCategory, DrillDifficulty } from "@/lib/drills";
import { Search, Filter, Clock, Users, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

export default function DrillsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | 'All'>('All');
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>(null);

  const filteredDrills = DRILLS.filter(drill => {
    const matchesSearch = drill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          drill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedDrillId(expandedDrillId === id ? null : id);
  };

  const getDifficultyColor = (difficulty: DrillDifficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'secondary';
      case 'Intermediate': return 'default';
      case 'Advanced': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Drill Library</h1>
        <p className="text-lg text-muted-foreground">Access a comprehensive collection of cricket coaching drills.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search drills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Batting', 'Bowling', 'Fielding', 'Fitness', 'Wicketkeeping'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-transparent text-muted-foreground border-border hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map(drill => (
          <Card key={drill.drillId} className="flex flex-col transition-transform hover:shadow-lg">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="outline" className="mb-2">{drill.category}</Badge>
                  <h3 className="text-xl font-semibold">{drill.title}</h3>
                </div>
                <Badge variant={getDifficultyColor(drill.difficulty)}>{drill.difficulty}</Badge>
              </div>

              <p className="text-muted-foreground mb-6">
                {drill.description}
              </p>

              <div className="flex gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {drill.durationMinutes} min
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {drill.minPlayers}-{drill.maxPlayers} players
                </div>
              </div>

              {expandedDrillId === drill.drillId && (
                <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-primary">Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                      {drill.equipment.map((item, i) => (
                        <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-primary">Instructions</h4>
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                      {drill.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-primary">Coaching Points</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {drill.coachingPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 pt-0">
              <button 
                onClick={() => toggleExpand(drill.drillId)}
                className="w-full py-3 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {expandedDrillId === drill.drillId ? (
                  <>Less Details <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>View Details <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
