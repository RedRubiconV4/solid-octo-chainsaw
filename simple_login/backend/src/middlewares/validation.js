import { z } from 'zod'

export const signupSchema = z.object({
    username: z.string(),
    password: z.string().min(8)
});

export const loginSchema = z.object({
    username: z.string().min(1).max(100),
    password: z.string()
});