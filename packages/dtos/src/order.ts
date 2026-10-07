import { z } from "zod";
import { emailSchema, idSchema } from "./common.js";
import { pizzaSizeSchema } from "./pizza.js";

const cartItemBase = {
    id: z.string().min(1),
    name: z.string().min(1),
    /** Unit price at the time the order was placed. */
    price: z.number().nonnegative(),
    quantity: z.number().int().positive(),
};

export const cartItemSchema = z.discriminatedUnion("type", [
    /** A pizza from the menu. */
    z.object({ type: z.literal("pizza"), ...cartItemBase }),
    /** A pizza built by the customer; each half is a list of ingredient ids. */
    z.object({
        type: z.literal("custom_pizza"),
        ...cartItemBase,
        size: pizzaSizeSchema,
        halves: z.array(z.array(idSchema)).min(1),
        description: z.string(),
    }),
    /** A drink or dessert. */
    z.object({ type: z.literal("product"), ...cartItemBase }),
]);
export type CartItem = z.infer<typeof cartItemSchema>;

export const orderStatusSchema = z.enum(["placed", "in_progress", "completed"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderSchema = z.object({
    id: idSchema,
    userEmail: emailSchema,
    /** ISO 8601 timestamp. */
    createdAt: z.iso.datetime(),
    address: z.string().min(1),
    items: z.array(cartItemSchema).min(1),
    status: orderStatusSchema,
});
export type Order = z.infer<typeof orderSchema>;

export const placeOrderInputSchema = z.object({
    address: z.string().min(1),
    items: z.array(cartItemSchema).min(1),
});
export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
