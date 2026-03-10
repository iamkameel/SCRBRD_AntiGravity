import { z } from 'zod';

// Team validation schema
export const teamSchema = z.object({
    name: z.string()
        .min(1, 'Team name is required')
        .min(2, 'Team name must be at least 2 characters')
        .max(100, 'Team name must be less than 100 characters'),

    organisationId: z.string().min(1, 'Organisation/School is required'),
    seasonId: z.string().min(1, 'Season is required'),
    ageDivisionId: z.string().min(1, 'Age Division is required'),
    teamClassId: z.string().min(1, 'Team Class is required'),

    abbreviatedName: z.string()
        .max(10, 'Abbreviation must be 10 characters or less')
        .optional()
        .or(z.literal('')),

    nickname: z.string()
        .max(50, 'Nickname must be less than 50 characters')
        .optional()
        .or(z.literal('')),

    displayName: z.string()
        .max(100, 'Display name must be less than 100 characters')
        .optional()
        .or(z.literal('')),

    shortName: z.string()
        .max(20, 'Short name must be less than 20 characters')
        .optional()
        .or(z.literal('')),

    suffix: z.string()
        .max(20, 'Suffix must be less than 20 characters')
        .optional()
        .or(z.literal('')),

    sport: z.string().optional(),
    status: z.string().optional(),

    defaultCaptainId: z.string().optional().or(z.literal('')),
    defaultViceCaptainId: z.string().optional().or(z.literal('')),
    defaultScorerId: z.string().optional().or(z.literal('')),
    coachIds: z.array(z.string()).optional(),
});

export type TeamFormData = z.infer<typeof teamSchema>;

// Backward-compatible aliases (migrated from lib/schemas/teamSchemas.ts)
export const TeamSchema = teamSchema;
export type TeamInput = TeamFormData;
