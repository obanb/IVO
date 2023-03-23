import {z} from 'zod';

export const WithDatatypeSchema = z.object({
    datatype: z.string(),
});

export type WithDatatype = z.infer<typeof WithDatatypeSchema>;
