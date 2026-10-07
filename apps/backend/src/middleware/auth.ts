import type { RequestHandler } from "express";
import type { Role, TokenPayload } from "@pizzaria/dtos";
import { HttpError } from "../lib/errors.js";
import { verifyToken } from "../lib/auth.js";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

const extractToken = (header: string | undefined): string | undefined =>
    header?.replace(/^Bearer\s+/i, "") || undefined;

/** Requires a valid JWT in `Authorization: Bearer <token>`. */
export const authenticate: RequestHandler = (req, _res, next) => {
    const token =
        extractToken(req.header("authorization")) ??
        extractToken(req.header("x-access-token"));
    if (!token) throw new HttpError(401, "No token provided");
    try {
        req.user = verifyToken(token);
    } catch {
        throw new HttpError(401, "Invalid or expired token");
    }
    next();
};

/** Must run after `authenticate`. */
export const requireRole =
    (...roles: Role[]): RequestHandler =>
    (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new HttpError(403, "Access denied");
        }
        next();
    };

export const currentUser = (req: Express.Request): TokenPayload => {
    if (!req.user) throw new HttpError(401, "Not authenticated");
    return req.user;
};
