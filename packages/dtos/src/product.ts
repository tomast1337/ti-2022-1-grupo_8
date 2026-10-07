import { z } from "zod";
import { idSchema, moneySchema } from "./common.js";

export const productSchema = z.object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string(),
    price: moneySchema,
    image: z.string(),
});
export type Product = z.infer<typeof productSchema>;

export const productInputSchema = z.object({
    id: idSchema.optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: moneySchema,
});
export type ProductInput = z.infer<typeof productInputSchema>;
