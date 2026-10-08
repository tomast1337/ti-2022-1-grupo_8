import { z } from "zod";
import {
    idSchema,
    moneySchema,
    jsonToObject,
    translationsSchema,
} from "./common.js";

export const productSchema = z.object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string(),
    price: moneySchema,
    image: z.string(),
    /** Other languages; present only when the admin asks for the raw item. */
    translations: translationsSchema.optional(),
});
export type Product = z.infer<typeof productSchema>;

export const productInputSchema = z.object({
    id: idSchema.optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: moneySchema,
    translations: z.preprocess(jsonToObject, translationsSchema).default({}),
});
export type ProductInput = z.infer<typeof productInputSchema>;
