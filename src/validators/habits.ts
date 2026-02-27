import { z } from 'zod';

export const CreateHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  category: z.enum(['health', 'fitness', 'mindfulness', 'learning', 'social']),
  targetFrequency: z
    .number()
    .int('Target frequency must be an integer')
    .min(1, 'Minimum is 1x per wk')
    .max(7, 'Maximum is 7x per wk'),
  statBoost: z.enum(['happiness', 'hunger', 'energy']),
});

export type CreateBody = z.infer<typeof CreateHabitSchema>;
