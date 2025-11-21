import { z } from 'zod';

export const messageCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000),
});

export type MessageCreate = z.infer<typeof messageCreateSchema>;
