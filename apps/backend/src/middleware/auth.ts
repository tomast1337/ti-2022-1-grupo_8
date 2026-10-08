import type { RequestHandler } from "express";
import type { Role, TokenPayload, User } from "@pizzaria/dtos";
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

interface UserLookup {
    findById(id: string): Promise<User | undefined>;
}

/**
 * Requires a valid JWT in `Authorization: Bearer <token>`.
 *
 * The token only proves who the user is. Email and role are read from the
 * database on every request, so a deleted user is locked out and a role change
 * applies immediately instead of when the token expires.
 */
export const authenticate =
    (users: UserLookup): RequestHandler =>
    async (req, _res, next) => {
        const token = extractToken(req.header("authorization"));
        if (!token) throw new HttpError(401, "No token provided", "no_token");
        let claims: TokenPayload;
        try {
            claims = verifyToken(token);
        } catch {
            throw new HttpError(
                401,
                "Invalid or expired token",
                "invalid_token",
            );
        }
        const user = await users.findById(claims.id);
        if (!user) {
            throw new HttpError(
                401,
                "Invalid or expired token",
                "invalid_token",
            );
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    };

/** Must run after `authenticate`. */
export const requireRole =
    (...roles: Role[]): RequestHandler =>
    (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new HttpError(403, "Access denied", "forbidden");
        }
        next();
    };

export const currentUser = (req: Express.Request): TokenPayload => {
    if (!req.user)
        throw new HttpError(401, "Not authenticated", "not_authenticated");
    return req.user;
};
