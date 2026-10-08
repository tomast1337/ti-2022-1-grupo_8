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

/** Name and description of a catalog item in one language (empty fields fall back to the default). */
export const translationSchema = z.object({
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
});
export type Translation = z.infer<typeof translationSchema>;

/**
 * Translations of a catalog item keyed by language code ("pt-BR", "lt"...).
 * The item's own `name`/`description` are the default (English) text.
 */
export const translationsSchema = z.record(
    z.string().regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/),
    translationSchema,
);
export type Translations = z.infer<typeof translationsSchema>;

/** Multipart form fields arrive as strings, so objects are sent as JSON text. */
export const jsonToObject = (value: unknown): unknown => {
    if (typeof value !== "string") return value;
    if (value.trim() === "") return {};
    try {
        return JSON.parse(value);
    } catch {
        return value; // fails validation with a clear error
    }
};

export const apiErrorSchema = z.object({
    error: z.string(),
    code: z.string().optional(),
    params: z.record(z.string(), z.string()).optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
