import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { config } from "../config.js";

export const REFRESH_COOKIE = "refresh_token";

/** Opaque random token: the cookie holds it, the database only its hash. */
export const newRefreshToken = () => randomBytes(32).toString("base64url");
export const hashRefreshToken = (token: string) =>
    createHash("sha256").update(token).digest("hex");

export const refreshExpiry = () =>
    new Date(Date.now() + config.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

// scoped to /auth so the browser never sends it to the rest of the API
const cookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    path: "/auth",
});

export const setRefreshCookie = (res: Response, token: string, expires: Date) =>
    res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(), expires });

export const clearRefreshCookie = (res: Response) =>
    res.clearCookie(REFRESH_COOKIE, cookieOptions());

export const readRefreshCookie = (req: Request): string | undefined => {
    for (const part of (req.headers.cookie ?? "").split(";")) {
        const [name, ...value] = part.trim().split("=");
        if (name === REFRESH_COOKIE) return value.join("=") || undefined;
    }
    return undefined;
};
