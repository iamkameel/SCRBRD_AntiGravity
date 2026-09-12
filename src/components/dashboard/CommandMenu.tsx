"use client";

import * as React from "react";
import {
  Calendar,
  Search,
  School,
  User,
  Plus,
  Settings,
  Database,
  Terminal,
} from "lucide-react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { fetchSchools, fetchMatches, fetchPlayers } from "@/lib/firestore";
import { Match, School as SchoolType, Person } from "@/types/firestore";

export function CommandMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [schools, setSchools] = React.useState<SchoolType[]>([]);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [players, setPlayers] = React.useState<Person[]>([]);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load data for search
  React.useEffect(() => {
    if (open) {
      const loadData = async () => {
        const [schoolData, matchData, playerData] = await Promise.all([
          fetchSchools(),
          fetchMatches(20),
          fetchPlayers(20),
        ]);
        setSchools(schoolData);
        setMatches(matchData);
        setPlayers(playerData);
      };
      loadData();
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm p-4 cursor-default animate-in fade-in duration-300"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-[640px] bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300 group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-white/5 px-4 py-3 gap-3">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Command.Input
            placeholder="Search records, actions, or tools..."
            className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-muted-foreground/50 h-10"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black tracking-widest text-muted-foreground">
            ESC
          </div>
        </div>

        <Command.List className="max-h-[70vh] overflow-y-auto p-2 scrollbar-none antialiased">
          <Command.Empty className="py-12 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <Database className="h-8 w-8 opacity-20" />
              <p>No results found for your query.</p>
            </div>
          </Command.Empty>

          {/* Quick Actions */}
          <Command.Group heading="Quick Actions" className="px-2 py-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-2">
            <div className="grid gap-1 mt-1">
              <Item icon={Plus} label="Schedule New Match" onSelect={() => runCommand(() => router.push("/fixtures/create"))} />
              <Item icon={Settings} label="System Settings" onSelect={() => runCommand(() => router.push("/admin/settings"))} />
              <Item icon={Terminal} label="Developer Console" onSelect={() => runCommand(() => router.push("/admin/debug"))} />
            </div>
          </Command.Group>

          {/* Matches */}
          {matches.length > 0 && (
            <Command.Group heading="Recent Matches" className="px-2 py-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-4">
              <div className="grid gap-1 mt-1">
                {matches.map((match) => (
                  <Item 
                    key={match.id} 
                    icon={Calendar} 
                    label={`${match.homeTeamName} vs ${match.awayTeamName}`} 
                    subtitle={match.venue || "Match Detail"}
                    onSelect={() => runCommand(() => router.push(`/matches/${match.id}`))} 
                  />
                ))}
              </div>
            </Command.Group>
          )}

          {/* Schools */}
          {schools.length > 0 && (
            <Command.Group heading="Schools" className="px-2 py-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-4">
              <div className="grid gap-1 mt-1">
                {schools.map((school) => (
                  <Item 
                    key={school.id} 
                    icon={School} 
                    label={school.name} 
                    subtitle={school.motto || "School Profile"}
                    onSelect={() => runCommand(() => router.push(`/schools/${school.id}`))} 
                  />
                ))}
              </div>
            </Command.Group>
          )}

          {/* Players */}
          {players.length > 0 && (
            <Command.Group heading="Players" className="px-2 py-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-4">
              <div className="grid gap-1 mt-1">
                {players.map((player) => (
                  <Item 
                    key={player.id} 
                    icon={User} 
                    label={`${player.firstName} ${player.lastName}`} 
                    subtitle={player.role || "Player"}
                    onSelect={() => runCommand(() => router.push(`/players/${player.id}`))} 
                  />
                ))}
              </div>
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t border-white/5 p-3 flex items-center justify-between text-[11px] text-muted-foreground bg-black/20">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono">↵</kbd> Select</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono">↑↓</kbd> Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold border-white/10 text-primary">V2 Intelligence</Badge>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}

function Item({ 
  icon: Icon, 
  label, 
  subtitle, 
  onSelect 
}: { 
  icon: any, 
  label: string, 
  subtitle?: string, 
  onSelect: () => void 
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground group transition-all duration-200"
    >
      <div className="p-2 bg-primary/10 rounded-lg group-aria-selected:bg-white/20">
        <Icon className="h-4 w-4 text-primary group-aria-selected:text-white" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-sm tracking-tight truncate">{label}</span>
        {subtitle && <span className="text-[10px] opacity-70 truncate font-medium group-aria-selected:opacity-90">{subtitle}</span>}
      </div>
    </Command.Item>
  );
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${className}`}>
      {children}
    </span>
  );
}
