/** Stable identifiers the frontend translates. `message` stays English, for logs and other clients. */
export type ErrorCode =
    | "no_token"
    | "invalid_token"
    | "forbidden"
    | "not_authenticated"
    | "csrf"
    | "invalid_credentials"
    | "no_refresh_token"
    | "invalid_refresh_token"
    | "refresh_token_expired"
    | "refresh_token_reused"
    | "email_taken"
    | "validation"
    | "invalid_image"
    | "not_found"
    | "unknown_item"
    | "order_status_mismatch"
    | "order_status_changed"
    | "cannot_demote_self"
    | "cannot_delete_self"
    | "ingredients_missing";

export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly code?: ErrorCode,
        /** Values for the translated message, e.g. `{ what: "User" }`. */
        readonly params?: Record<string, string>,
    ) {
        super(message);
    }
}

export const notFound = (what: string) =>
    new HttpError(404, `${what} not found`, "not_found", { what });
