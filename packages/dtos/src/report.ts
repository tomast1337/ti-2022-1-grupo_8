import { z } from "zod";

export const reportQuerySchema = z.object({
    /** Defaults to 30 days before `to`. */
    from: z.coerce.date().optional(),
    /** Defaults to now. */
    to: z.coerce.date().optional(),
});
export type ReportQuery = z.infer<typeof reportQuerySchema>;

export const reportRowSchema = z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number(),
    revenue: z.number(),
});
export type ReportRow = z.infer<typeof reportRowSchema>;

export const reportSchema = z.object({
    ingredients: z.array(reportRowSchema),
    pizzas: z.array(reportRowSchema),
    products: z.array(reportRowSchema),
});
export type Report = z.infer<typeof reportSchema>;
