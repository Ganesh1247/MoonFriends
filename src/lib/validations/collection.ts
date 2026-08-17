import { z } from 'zod';

export const collectionSchema = z.object({
  contributorName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  houseNumber: z
    .string()
    .min(1, 'House/Door number is required')
    .max(20, 'House number must be less than 20 characters')
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(10000000, 'Amount cannot exceed ₹1,00,00,000'),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque', 'other']),
  collectionDate: z.string().min(1, 'Date is required'),
  collectionTime: z.string().min(1, 'Time is required'),
  note: z
    .string()
    .min(1, 'Note is required for every transaction')
    .max(500, 'Note must be less than 500 characters')
    .trim()
    .refine((val) => val.trim().length > 0, {
      message: 'Note cannot be only whitespace',
    }),
});

export const collectionEditSchema = collectionSchema.extend({
  reason: z
    .string()
    .min(1, 'Reason for change is required')
    .max(500, 'Reason must be less than 500 characters')
    .trim()
    .refine((val) => val.trim().length > 0, {
      message: 'Reason cannot be only whitespace',
    }),
});

export type CollectionSchemaType = z.infer<typeof collectionSchema>;
export type CollectionEditSchemaType = z.infer<typeof collectionEditSchema>;
