import { z } from "zod";

export const idSchema = z.uuid();
/** Trimmed and lower-cased so "Ana@x.com" and "ana@x.com" are the same account. */
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const moneySchema = z.coerce.number().nonnegative();

/** Multipart form fields arrive as strings, e.g. "id1,id2,id3". */
export const csvToArray = (value: unknown): unknown =>
    typeof value === "string"
        ? value
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
        : value;

export const apiErrorSchema = z.object({
    error: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
