import { z } from 'zod';

// Season validation schema
export const seasonSchema = z.object({
  name: z.string()
    .min(1, 'Season name is required')
    .min(4, 'Name must be at least 4 characters') // e.g., "2024"
    .max(50, 'Name must be less than 50 characters'),

  startDate: z.string()
    .min(1, 'Start date is required'),

  endDate: z.string()
    .min(1, 'End date is required'),

  status: z.enum(['Upcoming', 'Active', 'Completed', 'Archived'], {
    message: 'Please select a valid status'
  }),

  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),

  isCurrent: z.boolean().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type SeasonFormData = z.infer<typeof seasonSchema>;

// Backward-compatible aliases (migrated from lib/schemas/seasonSchemas.ts)
export const SeasonSchema = seasonSchema;
