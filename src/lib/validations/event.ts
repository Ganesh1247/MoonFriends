import { z } from 'zod';

export const eventSchema = z.object({
  name: z
    .string()
    .min(2, 'Event name must be at least 2 characters')
    .max(100)
    .trim(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200)
    .trim(),
  responsiblePerson: z
    .string()
    .min(2, 'Responsible person is required')
    .max(100)
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default(''),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
});

export type EventSchemaType = z.infer<typeof eventSchema>;
