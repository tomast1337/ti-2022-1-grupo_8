import { loginResponseSchema, type LoginResponse } from "@pizzaria/dtos";
import { API_URL } from "../lib/config";

/** Marks the request as ours: a cross-site form cannot send a custom header. */
export const CSRF_HEADER = { "x-requested-by": "pizzaria" };

let inFlight: Promise<LoginResponse | null> | null = null;

/**
 * Trades the refresh cookie for a new access token, or null when there is no
 * valid session. Refresh tokens rotate, so parallel callers share one request.
 */
export const refreshSession = (): Promise<LoginResponse | null> => {
    inFlight ??= (async () => {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
                headers: CSRF_HEADER,
            });
            if (!response.ok) return null;
            const parsed = loginResponseSchema.safeParse(await response.json());
            return parsed.success ? parsed.data : null;
        } catch {
            return null; // API unreachable: treat as signed out
        }
    })().finally(() => {
        inFlight = null;
    });
    return inFlight;
};

/** Tells the API to revoke the refresh token and clear its cookie. */
export const endSession = async (): Promise<void> => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: CSRF_HEADER,
            keepalive: true, // survives the page navigating away
        });
    } catch {
        // offline: the cookie expires on its own
    }
};
