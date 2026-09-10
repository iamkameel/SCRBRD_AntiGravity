import { getLeagueById } from "@/services/leagueService";
import { notFound } from "next/navigation";
import { CompetitionViewClient } from "@/components/competitions/CompetitionViewClient";

// Mock Data for KZN School League
const MOCK_STANDINGS = [
  { teamId: 't1', teamName: 'Westville Boys', played: 10, won: 8, lost: 1, tied: 0, noResult: 1, points: 34, netRunRate: 1.25, recentForm: ['W','W','NR','W','L'] as any },
  { teamId: 't2', teamName: 'Hilton College', played: 10, won: 7, lost: 2, tied: 1, noResult: 0, points: 30, netRunRate: 0.95, recentForm: ['W','L','T','W','W'] as any },
  { teamId: 't3', teamName: 'Michaelhouse', played: 10, won: 6, lost: 3, tied: 0, noResult: 1, points: 26, netRunRate: 0.45, recentForm: ['L','W','W','NR','W'] as any },
  { teamId: 't4', teamName: 'Northwood', played: 10, won: 5, lost: 4, tied: 0, noResult: 1, points: 22, netRunRate: 0.15, recentForm: ['W','L','W','L','NR'] as any },
  { teamId: 't5', teamName: 'Maritzburg College', played: 10, won: 5, lost: 5, tied: 0, noResult: 0, points: 20, netRunRate: -0.12, recentForm: ['L','L','W','W','L'] as any },
  { teamId: 't6', teamName: 'DHS', played: 10, won: 3, lost: 6, tied: 0, noResult: 1, points: 14, netRunRate: -0.55, recentForm: ['L','W','L','NR','L'] as any },
  { teamId: 't7', teamName: 'Kearsney College', played: 10, won: 2, lost: 7, tied: 1, noResult: 0, points: 10, netRunRate: -0.85, recentForm: ['L','T','L','L','L'] as any },
  { teamId: 't8', teamName: 'Clifton College', played: 10, won: 1, lost: 9, tied: 0, noResult: 0, points: 4, netRunRate: -1.35, recentForm: ['L','L','L','L','W'] as any },
];

const MOCK_ROUNDS = [
  {
    title: "Quarter-Finals",
    matches: [
      { id: "q1", team1: { id: "t1", name: "Westville Boys", score: "185/4", winner: true }, team2: { id: "t8", name: "Clifton College", score: "120/10" }, date: "Tomorrow, 09:30", status: "completed" as any },
      { id: "q2", team1: { id: "t4", name: "Northwood", score: "145/8" }, team2: { id: "t5", name: "Maritzburg College", score: "148/2", winner: true }, date: "Tomorrow, 09:30", status: "completed" as any },
      { id: "q3", team1: { id: "t2", name: "Hilton College", score: "210/5", winner: true }, team2: { id: "t7", name: "Kearsney College", score: "190/9" }, date: "Tomorrow, 09:30", status: "completed" as any },
      { id: "q4", team1: { id: "t3", name: "Michaelhouse", score: "160/10" }, team2: { id: "t6", name: "DHS", score: "162/4", winner: true }, date: "Tomorrow, 09:30", status: "completed" as any },
    ]
  },
  {
    title: "Semi-Finals",
    matches: [
      { id: "s1", team1: { id: "t1", name: "Westville Boys", score: "195/3" }, team2: { id: "t5", name: "Maritzburg College", score: "120/4" }, date: "Sat, 09:00", status: "live" as any },
      { id: "s2", team1: { id: "t2", name: "Hilton College" }, team2: { id: "t6", name: "DHS" }, date: "Sat, 14:00", status: "pending" as any },
    ]
  },
  {
    title: "Finals",
    matches: [
      { id: "f1", team1: { id: "tbd1", name: "Winner SF1" }, team2: { id: "tbd2", name: "Winner SF2" }, date: "Sun, 09:30", status: "pending" as any },
    ]
  }
];

export default async function LeagueDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const league = await getLeagueById(id);
  
  if (!league) {
    notFound();
  }

  return (
    <CompetitionViewClient 
      league={league}
      standings={MOCK_STANDINGS}
      bracketRounds={MOCK_ROUNDS}
    />
  );
}
