import { z } from 'zod';

// Transaction validation schema
export const transactionSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(100, 'Description must be less than 100 characters'),

  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 10000000;
    }, 'Amount must be a positive number up to 10,000,000'),

  type: z.enum(['Income', 'Expense'], {
    message: 'Please select a transaction type'
  }),

  category: z.string()
    .min(1, 'Category is required'),

  date: z.string()
    .min(1, 'Date is required')
    .refine((date) => {
      const transactionDate = new Date(date);
      // Allow future dates for budgeting/planning, but maybe warn?
      // For now, just ensure it's a valid date
      return !isNaN(transactionDate.getTime());
    }, 'Invalid date'),

  paymentMethod: z.enum(['Cash', 'EFT', 'Credit Card', 'Debit Card', 'Check', 'Other'], {
    message: 'Please select a payment method'
  }),

  reference: z.string()
    .max(50, 'Reference must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  status: z.enum(['Pending', 'Completed', 'Cancelled', 'Refunded'], {
    message: 'Please select a status'
  }),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// Backward-compatible aliases (migrated from lib/schemas/transactionSchemas.ts)
export const TransactionSchema = transactionSchema;
export type TransactionInput = TransactionFormData;
