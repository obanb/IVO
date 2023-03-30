import {z} from 'zod';

export const ResendByRangeRequestSchema = z.object({
    from: z.number(),
    to: z.number(),
});

export type ResendByRangeRequest = z.infer<typeof ResendByRangeRequestSchema>;

export const ResendByNumberRequestSchema = z.object({
    number: z.number(),
});

export type ResendByNumberRequest = z.infer<typeof ResendByNumberRequestSchema>;
