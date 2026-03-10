import { z } from 'zod';

// School validation schema
export const schoolSchema = z.object({
  name: z.string()
    .min(1, 'School name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  abbreviation: z.string()
    .max(10, 'Abbreviation must be 10 characters or less')
    .optional()
    .or(z.literal('')),

  motto: z.string()
    .max(100, 'Motto must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  establishmentYear: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseInt(val);
      const currentYear = new Date().getFullYear();
      return !isNaN(num) && num >= 1000 && num <= currentYear;
    }, `Year must be between 1000 and ${new Date().getFullYear()}`),

  contactEmail: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  contactPhone: z.string()
    .regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),

  contactName: z.string()
    .max(100, 'Contact name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  principal: z.string()
    .max(100, 'Principal name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  logoUrl: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),

  primaryColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
    .optional()
    .or(z.literal('')),

  secondaryColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
    .optional()
    .or(z.literal('')),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;

// Backward-compatible aliases (migrated from lib/schemas/schoolSchemas.ts)
export const SchoolSchema = schoolSchema;
export type SchoolInput = SchoolFormData;
