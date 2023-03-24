import {z} from 'zod';
import {ObjectId} from 'mongodb';

export const SortedMessageSchema = z.object({
    datatype: z.string(),
    chunks: z.boolean(),
    fs: z.boolean(),
    personalisation: z.boolean(),
    ods: z.boolean(),
    data: z.unknown().optional(),
});

export type SortedMessage = z.infer<typeof SortedMessageSchema>;

export const SortedMessageChunkSchema = z.object({
    index: z.number().optional(),
    parent: z.instanceof(ObjectId),
    data: z.string(),
});

export type SortedMessageChunk = z.infer<typeof SortedMessageChunkSchema>;
