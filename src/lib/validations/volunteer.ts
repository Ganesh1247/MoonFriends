import { z } from 'zod';

export const volunteerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  responsibility: z
    .string()
    .min(2, 'Responsibility is required')
    .max(100)
    .trim(),
  assignedEventId: z.string().optional(),
  availabilityStart: z.string().min(1, 'Start date is required'),
  availabilityEnd: z.string().min(1, 'End date is required'),
  notes: z.string().max(500).optional().default(''),
});

export type VolunteerSchemaType = z.infer<typeof volunteerSchema>;
