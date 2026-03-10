"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School, Plus, X, Building2, Users } from "lucide-react";
import { fetchSchools, fetchTeams } from "@/lib/firestore";
import type { School as SchoolType, Team } from "@/types/firestore";

interface SchoolTeamAssignmentProps {
  initialSchools?: string[];
  initialTeams?: string[];
  onChange?: (data: { schools: string[]; teams: string[] }) => void;
  mode?: "inline" | "card";
}

export function SchoolTeamAssignment({
  initialSchools = [],
  initialTeams = [],
  onChange,
  mode = "card",
}: SchoolTeamAssignmentProps) {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>(initialSchools);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(initialTeams);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch schools and teams on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [schoolsData, teamsData] = await Promise.all([
          fetchSchools(),
          fetchTeams(),
        ]);
        setSchools(schoolsData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to load schools/teams:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onChange?.({ schools: selectedSchools, teams: selectedTeams });
  }, [selectedSchools, selectedTeams, onChange]);

  const addSchool = () => {
    if (selectedSchoolId && !selectedSchools.includes(selectedSchoolId)) {
      setSelectedSchools([...selectedSchools, selectedSchoolId]);
      setSelectedSchoolId("");
    }
  };

  const removeSchool = (schoolId: string) => {
    setSelectedSchools(selectedSchools.filter((id) => id !== schoolId));
    // Also remove teams from this school
    const schoolTeams = teams.filter((t) => t.schoolId === schoolId).map((t) => t.id);
    setSelectedTeams(selectedTeams.filter((id) => !schoolTeams.includes(id)));
  };

  const addTeam = () => {
    if (selectedTeamId && !selectedTeams.includes(selectedTeamId)) {
      const team = teams.find((t) => t.id === selectedTeamId);
      if (team) {
        // Auto-add the team's school if not already added
        if (!selectedSchools.includes(team.schoolId)) {
          setSelectedSchools([...selectedSchools, team.schoolId]);
        }
        setSelectedTeams([...selectedTeams, selectedTeamId]);
        setSelectedTeamId("");
      }
    }
  };

  const removeTeam = (teamId: string) => {
    setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
  };

  const getSchoolName = (schoolId: string) => {
    return schools.find((s) => s.id === schoolId)?.name || schoolId;
  };

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || teamId;
  };

  const getTeamSchool = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? schools.find((s) => s.id === team.schoolId) : null;
  };

  // Filter teams by selected schools
  const availableTeams = teams.filter((team) =>
    selectedSchools.includes(team.schoolId)
  );

  const content = (
    <div className="space-y-6">
      {/* Schools Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Assigned Schools
          </Label>
          <Badge variant="secondary" className="text-xs">
            {selectedSchools.length}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a school..." />
            </SelectTrigger>
            <SelectContent>
              {schools
                .filter((school) => !selectedSchools.includes(school.id))
                .map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            onClick={addSchool}
            disabled={!selectedSchoolId}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {selectedSchools.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSchools.map((schoolId) => (
              <Badge
                key={schoolId}
                variant="default"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                <Building2 className="h-3 w-3" />
                {getSchoolName(schoolId)}
                <button
                  type="button"
                  onClick={() => removeSchool(schoolId)}
                  className="hover:text-destructive ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No schools assigned yet
          </p>
        )}

        {/* Hidden inputs for form submission */}
        {selectedSchools.map((schoolId, index) => (
          <input
            key={schoolId}
            type="hidden"
            name={`assignedSchools[${index}]`}
            value={schoolId}
          />
        ))}
      </div>

      {/* Teams Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assigned Teams
          </Label>
          <Badge variant="secondary" className="text-xs">
            {selectedTeams.length}
          </Badge>
        </div>

        {selectedSchools.length > 0 ? (
          <>
            <div className="flex gap-2">
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a team..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams
                    .filter((team) => !selectedTeams.includes(team.id))
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({getSchoolName(team.schoolId)})
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={addTeam}
                disabled={!selectedTeamId}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedTeams.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTeams.map((teamId) => {
                  const school = getTeamSchool(teamId);
                  return (
                    <Badge
                      key={teamId}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                    >
                      <Users className="h-3 w-3" />
                      {getTeamName(teamId)}
                      {school && (
                        <span className="text-[10px] opacity-70">
                          ({school.abbreviation || school.name})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeTeam(teamId)}
                        className="hover:text-destructive ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No teams assigned yet
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md border border-dashed">
            Please assign at least one school first to select teams
          </p>
        )}

        {/* Hidden inputs for form submission */}
        {selectedTeams.map((teamId, index) => (
          <input
            key={teamId}
            type="hidden"
            name={`teamIds[${index}]`}
            value={teamId}
          />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading schools and teams...
      </div>
    );
  }

  if (mode === "inline") {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <School className="h-5 w-5" />
          School & Team Assignment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign this person to schools and teams for proper access control
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
