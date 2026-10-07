import { z } from "zod";
import { csvToArray, idSchema } from "./common.js";

export const pizzaSizeSchema = z.enum(["small", "medium", "large", "family"]);
export type PizzaSize = z.infer<typeof pizzaSizeSchema>;

export const pizzaSchema = z.object({
    id: idSchema,
    name: z.string().min(1),
    description: z.string(),
    image: z.string(),
    ingredientIds: z.array(idSchema),
    /** Computed by the API: base price + ingredient prices. */
    price: z.number().nonnegative(),
});
export type Pizza = z.infer<typeof pizzaSchema>;

export const pizzaInputSchema = z.object({
    id: idSchema.optional(),
    name: z.string().min(1),
    description: z.string().min(1),
    ingredientIds: z.preprocess(csvToArray, z.array(idSchema).min(1)),
});
export type PizzaInput = z.infer<typeof pizzaInputSchema>;
