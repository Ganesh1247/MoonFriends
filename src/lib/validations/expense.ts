import { z } from 'zod';

export const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters')
    .max(200, 'Description must be less than 200 characters')
    .trim(),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(10000000, 'Amount cannot exceed ₹1,00,00,000'),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque', 'other']),
  paidTo: z
    .string()
    .min(2, 'Paid to is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  expenseDate: z.string().min(1, 'Date is required'),
  expenseTime: z.string().min(1, 'Time is required'),
  note: z
    .string()
    .min(1, 'Note is required for every transaction')
    .max(500, 'Note must be less than 500 characters')
    .trim()
    .refine((val) => val.trim().length > 0, {
      message: 'Note cannot be only whitespace',
    }),
});

export const expenseEditSchema = expenseSchema.extend({
  reason: z
    .string()
    .min(1, 'Reason for change is required')
    .max(500, 'Reason must be less than 500 characters')
    .trim()
    .refine((val) => val.trim().length > 0, {
      message: 'Reason cannot be only whitespace',
    }),
});

export type ExpenseSchemaType = z.infer<typeof expenseSchema>;
export type ExpenseEditSchemaType = z.infer<typeof expenseEditSchema>;
