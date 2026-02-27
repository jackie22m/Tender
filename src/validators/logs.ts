import { z } from 'zod';

export const CreateLogSchema = z.object({
  habitId: z.number(),
  note: z.string().min(1).max(200, '200 characters max').optional(),
});

export type CreateLogBody = z.infer<typeof CreateLogSchema>;
