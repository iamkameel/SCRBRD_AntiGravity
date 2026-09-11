export interface MatchRecapData {
    fixtureId: string;
    matchTitle: string;
    competitionName: string;
    venueName: string;
    matchDate: string;
    resultSummary: string;
    winnerTeamName: string;
    margin: string;

    firstInnings: {
        teamName: string;
        score: string;
        overs: string;
        topBatters: { name: string; runs: number; balls: number; fours: number; sixes: number }[];
        topBowlers: { name: string; wickets: number; runs: number; overs: number }[];
    };

    secondInnings: {
        teamName: string;
        score: string;
        overs: string;
        topBatters: { name: string; runs: number; balls: number; fours: number; sixes: number }[];
        topBowlers: { name: string; wickets: number; runs: number; overs: number }[];
    };

    playerOfTheMatch: {
        name: string;
        team: string;
        performanceSummary: string;
        avatarUrl?: string;
    };

    generatedContent: {
        pressReleaseHeadline: string;
        pressReleaseBody: string;
        newsletterSnippet: string;
        socialPostX: string;
        socialPostInstagramCaption: string;
    };

    turningPoints: {
        over: string;
        event: string;
        description: string;
        impact: 'HIGH' | 'GAME_CHANGER' | 'CLUTCH';
    }[];
}

export const MOCK_RECAP_DATA: Record<string, MatchRecapData> = {
    'fix-1st-xi-kes': {
        fixtureId: 'fix-1st-xi-kes',
        matchTitle: "St John's College 1st XI vs King Edward VII School 1st XI",
        competitionName: 'Gauteng Schools T20 Premier League',
        venueName: "Mitchell Field, St John's College",
        matchDate: '2026-09-11',
        resultSummary: "St John's College 1st XI won by 4 wickets (with 2 balls remaining)",
        winnerTeamName: "St John's College 1st XI",
        margin: '4 wickets',

        firstInnings: {
            teamName: 'King Edward VII School 1st XI',
            score: '178/6',
            overs: '20.0',
            topBatters: [
                { name: 'Brandon Hendricks', runs: 68, balls: 42, fours: 7, sixes: 3 },
                { name: 'Matthew Miller', runs: 41, balls: 31, fours: 4, sixes: 1 },
            ],
            topBowlers: [
                { name: 'Kameel Kalyan', wickets: 3, runs: 24, overs: 4.0 },
                { name: 'David Smith', wickets: 2, runs: 31, overs: 4.0 },
            ],
        },

        secondInnings: {
            teamName: "St John's College 1st XI",
            score: '182/6',
            overs: '19.4',
            topBatters: [
                { name: 'Christopher Coetzee', runs: 74, balls: 46, fours: 8, sixes: 3 },
                { name: 'Ethan Botes', runs: 38, balls: 22, fours: 3, sixes: 2 },
            ],
            topBowlers: [
                { name: 'Sipho Ndlovu', wickets: 3, runs: 35, overs: 4.0 },
                { name: 'Liam Van Zyl', wickets: 2, runs: 28, overs: 3.4 },
            ],
        },

        playerOfTheMatch: {
            name: 'Christopher Coetzee',
            team: "St John's College 1st XI",
            performanceSummary: '74 runs off 46 balls (8x4, 3x6) & 2 catches',
        },

        generatedContent: {
            pressReleaseHeadline: "Coetzee Masterclass Guides St John's 1st XI to Dramatic Derby Victory Over KES",
            pressReleaseBody: `JOHANNESBURG — In a high-stakes Gauteng Schools T20 Premier League clash at Mitchell Field, St John's College 1st XI secured a memorable 4-wicket victory over arch-rivals King Edward VII School 1st XI with just two balls to spare.\n\nAfter winning the toss and electing to bat, KES posted a formidable 178/6 in their allotted 20 overs, driven by a blistering 68 (42 balls) from opening batter Brandon Hendricks. Kameel Kalyan was the standout bowler for St John's, claiming 3/24 in a disciplined 4-over spell that stemmed the mid-innings boundary flow.\n\nIn response, St John's mounted a calculated chase led by Player of the Match Christopher Coetzee. Coetzee struck a superb 74 off 46 deliveries, combining aggressive boundary hitting with clever strike rotation. Supported by a punchy 38 off 22 balls from Ethan Botes in the middle overs, St John's reached the target of 182/6 in the final over, sealing a thrilling win that cements their position at the top of the Premier League standings.`,
            newsletterSnippet: `🏏 DERBY DAY TRIUMPH! St John's College 1st XI defeated KES 1st XI by 4 wickets in a T20 thriller at Mitchell Field. Chasing KES's 178/6, Christopher Coetzee starring with 74 (46b) and Kameel Kalyan picking up 3/24. Full scorecard and player ratings available on SCRBRD!`,
            socialPostX: `RESULT: St John's 1st XI defeat KES 1st XI by 4 wickets! 🔥\n\nKES 178/6 (20.0) - Hendricks 68, Kalyan 3/24\nSJC 182/6 (19.4) - Coetzee 74 (46), Botes 38\n\nPlayer of the Match: Christopher Coetzee (74 off 46b) 🏆 #SCRBRD #SchoolCricket #DerbyDay`,
            socialPostInstagramCaption: `DERBY DAY BELONGS TO ST JOHN'S! 🔴🔵\n\nA match for the ages at Mitchell Field as St John's 1st XI chase down 178 against KES with 2 balls remaining!\n\n✨ Match Highlights:\n• Brandon Hendricks (KES): 68 (42)\n• Kameel Kalyan (SJC): 3/24 (4.0)\n• Christopher Coetzee (SJC): 74 (46) - POTM 🏆\n\nTap link in bio for full ball-by-ball replay and analytics breakdown on SCRBRD OS! 📊`,
        },

        turningPoints: [
            {
                over: 'Over 8.4',
                event: 'Kalyan Breaks Opening Partnership',
                description: 'Kameel Kalyan clean bowls Hendricks (68) just as KES looked poised for 200+.',
                impact: 'HIGH',
            },
            {
                over: 'Over 14.2',
                event: 'Coetzee - Botes 50 Partnership',
                description: 'Coetzee & Botes add 50 runs in just 26 balls to bring the required run rate under 9.0 RPO.',
                impact: 'GAME_CHANGER',
            },
            {
                over: 'Over 19.4',
                event: 'Winning Boundary',
                description: 'Ethan Botes pulls a back-of-a-length delivery through mid-wicket for 4 to seal the match.',
                impact: 'CLUTCH',
            },
        ],
    },
};

export function getMatchRecapData(fixtureId: string): MatchRecapData {
    return MOCK_RECAP_DATA[fixtureId] || MOCK_RECAP_DATA['fix-1st-xi-kes'];
}
