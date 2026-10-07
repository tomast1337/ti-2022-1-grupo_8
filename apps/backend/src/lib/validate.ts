import { z } from "zod";
import { HttpError } from "./errors.js";

/** Parse `data` with `schema`, turning failures into a 400 response. */
export const parse = <S extends z.ZodType>(
    schema: S,
    data: unknown,
): z.output<S> => {
    const result = schema.safeParse(data);
    if (!result.success) {
        const message = result.error.issues
            .map(
                (issue) =>
                    `${issue.path.join(".") || "body"}: ${issue.message}`,
            )
            .join("; ");
        throw new HttpError(400, message);
    }
    return result.data;
};

/** Validates a route parameter as uuid so malformed ids never reach Postgres. */
export const uuidParam = (value: unknown): string => parse(z.uuid(), value);
