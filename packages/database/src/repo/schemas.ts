import {z} from "zod";

export const SortedMessageSchema = z.object({
    datatype: z.string(),
});

export type SortedMessage = z.infer<typeof SortedMessageSchema>;
