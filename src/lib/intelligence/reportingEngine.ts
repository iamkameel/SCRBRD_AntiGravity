/**
 * School Sportsmaster Reporting & Export Engine
 * Generates executive summaries, CSV exports, and reporting telemetry for school directors & coaches.
 */

export interface ExecutiveReportSummary {
    schoolName: string;
    seasonName: string;
    totalFixtures: number;
    completedFixtures: number;
    winRate: number;
    totalRunsScored: number;
    totalWicketsTaken: number;
    milestonesAchieved: number;
    fieldMaintenanceHours: number;
    transportSafetyRate: number;
    topPerformers: {
        name: string;
        role: string;
        team: string;
        metric: string;
    }[];
    teamBreakdown: {
        teamName: string;
        played: number;
        won: number;
        lost: number;
        tied: number;
        winPct: number;
    }[];
}

export const MOCK_EXECUTIVE_SUMMARY: ExecutiveReportSummary = {
    schoolName: 'Wynberg Boys\' High School',
    seasonName: '2026 Summer Cricket Season',
    totalFixtures: 28,
    completedFixtures: 24,
    winRate: 75.0,
    totalRunsScored: 4820,
    totalWicketsTaken: 198,
    milestonesAchieved: 14,
    fieldMaintenanceHours: 142,
    transportSafetyRate: 100.0,
    topPerformers: [
        { name: 'Kameel Kalyani', role: 'Opener / Wicketkeeper', team: '1st XI', metric: '482 Runs @ 53.5 (SR 138.2)' },
        { name: 'Ethan Stuurman', role: 'Strike Pace Bowler', team: '1st XI', metric: '26 Wickets @ 12.4 (Econ 4.1)' },
        { name: 'David Miller', role: 'Middle-Order Batter', team: 'U15A', metric: '340 Runs @ 42.5' },
        { name: 'Sipho Ndlovu', role: 'Wrist Spinner', team: 'U15A', metric: '19 Wickets @ 14.1' },
    ],
    teamBreakdown: [
        { teamName: '1st XI Squad', played: 10, won: 8, lost: 2, tied: 0, winPct: 80.0 },
        { teamName: '2nd XI Squad', played: 6, won: 4, lost: 2, tied: 0, winPct: 66.7 },
        { teamName: 'U15A Squad', played: 5, won: 4, lost: 1, tied: 0, winPct: 80.0 },
        { teamName: 'U14A Squad', played: 3, won: 2, lost: 1, tied: 0, winPct: 66.7 },
    ]
};

/**
 * Generate CSV string from JSON data array
 */
export function generateCsv<T extends Record<string, any>>(data: T[], columns: { key: keyof T; label: string }[]): string {
    if (!data || data.length === 0) return '';
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row => {
        return columns.map(c => {
            const val = row[c.key];
            const str = val !== undefined && val !== null ? String(val).replace(/"/g, '""') : '';
            return `"${str}"`;
        }).join(',');
    });
    return [header, ...rows].join('\n');
}

/**
 * Trigger browser file download for a string blob (e.g. CSV or TXT)
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
