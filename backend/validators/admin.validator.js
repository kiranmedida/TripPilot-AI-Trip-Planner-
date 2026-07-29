import { z } from 'zod';

export const changeRoleSchema = z.object({
  body: z.object({
    role: z.enum(['User', 'Premium', 'Admin'], {
      errorMap: () => ({ message: 'Invalid role selection.' }),
    }),
  }),
});
