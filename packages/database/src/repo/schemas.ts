import {z} from 'zod';
import {ObjectId} from 'mongodb';

export const SortedMessageSchema = z.object({
    datatype: z.string(),
    chunks: z.boolean(),
    fs: z.boolean(),
    mystay: z.boolean(),
    personalisation: z.boolean(),
    data: z.unknown().optional(),
    error: z.boolean().optional(),
    errors: z.array(z.string()).optional(),
    msgNumber: z.number(),
});

export type SortedMessage = z.infer<typeof SortedMessageSchema>;

export const SortedMessageChunkSchema = z.object({
    index: z.number().optional(),
    parent: z.instanceof(ObjectId),
    data: z.string(),
});

export type SortedMessageChunk = z.infer<typeof SortedMessageChunkSchema>;

export const MonitoringSummarySchema = z.object({
    total: z.number(),
    fs: z.boolean(),
    personalisation: z.boolean(),
    mystay: z.boolean(),
});

export type MonitoringSummary = z.infer<typeof MonitoringSummarySchema>;
