import { z } from "zod";
import {
    idSchema,
    moneySchema,
    jsonToObject,
    translationsSchema,
} from "./common.js";

export const ingredientSchema = z.object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string(),
    price: moneySchema,
    /** Weight of one portion, in grams. */
    portionWeight: z.number().positive(),
    image: z.string(),
    /** Other languages; present only when the admin asks for the raw item. */
    translations: translationsSchema.optional(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

/** Fields of the multipart form used to create/update an ingredient. */
export const ingredientInputSchema = z.object({
    id: idSchema.optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: moneySchema,
    portionWeight: z.coerce.number().positive(),
    translations: z.preprocess(jsonToObject, translationsSchema).default({}),
});
export type IngredientInput = z.infer<typeof ingredientInputSchema>;
