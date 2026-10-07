import { z } from "zod";
import { idSchema, moneySchema } from "./common.js";

export const ingredientSchema = z.object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string(),
    price: moneySchema,
    /** Weight of one portion, in grams. */
    portionWeight: z.number().positive(),
    image: z.string(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

/** Fields of the multipart form used to create/update an ingredient. */
export const ingredientInputSchema = z.object({
    id: idSchema.optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: moneySchema,
    portionWeight: z.coerce.number().positive(),
});
export type IngredientInput = z.infer<typeof ingredientInputSchema>;
