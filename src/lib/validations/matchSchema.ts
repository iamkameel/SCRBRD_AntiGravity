import { z } from 'zod';

// Match validation schema
export const matchSchema = z.object({
  homeTeamId: z.string()
    .min(1, 'Home team is required'),

  awayTeamId: z.string()
    .min(1, 'Away team is required'),

  venueId: z.string()
    .min(1, 'Venue is required'),

  scheduledDate: z.string()
    .min(1, 'Match date is required')
    .refine((date) => {
      const matchDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchDate >= today;
    }, 'Match date cannot be in the past'),

  scheduledTime: z.string()
    .min(1, 'Match time is required')
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),

  format: z.enum(['T20', 'ODI', 'Test', 'First Class', 'Limited Overs', 'Other'], {
    message: 'Please select a match format'
  }),

  overs: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 100;
    }, 'Overs must be between 1 and 100'),

  leagueId: z.string().optional(),
  seasonId: z.string().optional(),
  divisionId: z.string().optional(),

  competition: z.string()
    .optional(),

  round: z.string()
    .optional(),

  umpire1Id: z.string()
    .optional(),

  umpire2Id: z.string()
    .optional(),

  scorerId: z.string()
    .optional(),

  broadcastUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),

  isDayNight: z.boolean().optional().default(false),

  status: z.enum(['scheduled', 'live', 'completed', 'cancelled', 'postponed']).optional().default('scheduled'),
  state: z.enum(['SCHEDULED', 'TEAM_SELECTION', 'PRE_MATCH', 'LIVE', 'INNINGS_BREAK', 'COMPLETED', 'CANCELLED', 'POSTPONED']).optional().default('SCHEDULED'),
});

// Refinement to ensure home and away teams are different
export const matchSchemaWithRefinements = matchSchema.refine(
  (data) => data.homeTeamId !== data.awayTeamId,
  {
    message: 'Home and away teams must be different',
    path: ['awayTeamId'],
  }
);

export type MatchFormData = z.infer<typeof matchSchema>;

// Backward-compatible aliases (migrated from lib/schemas/matchSchemas.ts)
export const MatchSchema = matchSchema;
export type MatchInput = MatchFormData;
